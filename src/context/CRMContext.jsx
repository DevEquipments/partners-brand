import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  leadRepository,
  quotationRepository,
  customerRepository,
  activityRepository,
  teamRepository,
} from "../repositories/local/crmRepository";
import { useAuth } from "./AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { getEligibleAssignees } from "../utils/accessRules";
import toast from "react-hot-toast";

const CRMContext = createContext(null);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};

export const CRMProvider = ({ children }) => {
  const { user, role } = useAuth();
  const { hasTerritoryAccess } = usePermissions();

  const [leads, setLeads] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all local data on mount
  const refreshCRM = useCallback(async () => {
    setLoading(true);
    try {
      const [allLeads, allQuotes, allTeam, allCust] = await Promise.all([
        leadRepository.getAll(),
        quotationRepository.getAll(),
        teamRepository.getAll(),
        customerRepository.getAll(),
      ]);
      setLeads(allLeads);
      setQuotations(allQuotes);
      setTeamMembers(allTeam);
      setCustomers(allCust);
    } catch (err) {
      console.error("Failed to load CRM data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadCRM = async () => {
      try {
        const [allLeads, allQuotes, allTeam, allCust] = await Promise.all([
          leadRepository.getAll(),
          quotationRepository.getAll(),
          teamRepository.getAll(),
          customerRepository.getAll(),
        ]);
        if (isMounted) {
          setLeads(allLeads);
          setQuotations(allQuotes);
          setTeamMembers(allTeam);
          setCustomers(allCust);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load CRM data", err);
        if (isMounted) setLoading(false);
      }
    };
    loadCRM();

    return () => {
      isMounted = false;
    };
  }, []);

  // Territory and Sub Admin Visibility Filtering:
  // Admin sees all leads across the entire country.
  // Sub Admin only sees leads assigned to them OR within their assigned territories.
  const visibleLeads = useMemo(() => {
    if (role === "ADMIN") {
      return leads;
    }
    const currentSubAdminId = user?.id;
    return leads.filter((lead) => {
      // Direct assignment match
      if (lead.assigned_to && String(lead.assigned_to) === String(currentSubAdminId)) {
        return true;
      }
      // Territory match
      return hasTerritoryAccess(lead.state, lead.city);
    });
  }, [leads, role, user?.id, hasTerritoryAccess]);

  // Unassigned Leads queue (Admin operational review)
  const unassignedLeads = useMemo(() => {
    return leads.filter((l) => !l.assigned_to);
  }, [leads]);

  // Action: Assign Lead with audit tracking and override support
  const assignLead = useCallback(
    async (leadId, subAdminId, assignmentType = "standard", overrideReason = "") => {
      try {
        const subAdmin = teamMembers.find((m) => String(m.id) === String(subAdminId));
        const subAdminName = subAdmin ? subAdmin.name : "Assigned Operator";
        const updated = await leadRepository.assign(leadId, subAdminId, subAdminName);

        let details = `Manual assignment by Admin (${user?.name || user?.username || "Admin"}).`;
        if (assignmentType === "override") {
          details = `Admin territory override assignment by ${user?.name || "Admin"}. Reason: ${overrideReason || "Out-of-territory manual assignment override confirmed."}`;
        } else if (assignmentType === "auto_rule") {
          details = `Automated routing rule applied based on territory & workload match.`;
        }

        // Record assignment activity in timeline
        await activityRepository.add({
          lead_id: leadId,
          type: "assignment",
          summary: `Lead assigned to ${subAdminName} (${assignmentType === "override" ? "Territory Override" : "Standard"})`,
          details,
          author_id: user?.id || "admin",
          author_name: user?.name || "Admin",
          assignment_type: assignmentType,
        });

        setLeads((prev) => prev.map((l) => (String(l.id) === String(leadId) ? updated : l)));
        toast.success(`Lead successfully assigned to ${subAdminName}`);
        return updated;
      } catch (err) {
        toast.error(err.message || "Assignment failed");
        throw err;
      }
    },
    [teamMembers, user]
  );

  // Action: Auto-Assign Lead based on Location and Workload
  const autoAssignLead = useCallback(
    async (leadId) => {
      const lead = leads.find((l) => String(l.id) === String(leadId));
      if (!lead) return null;

      // Find eligible assignees based on location (state + city) and operational permissions
      const eligible = getEligibleAssignees(lead, teamMembers, lead.type);
      if (eligible.length > 0) {
        // Operator with lowest active workload
        const workloadMap = eligible.map((member) => {
          const count = leads.filter(
            (l) =>
              String(l.assigned_to) === String(member.id) &&
              (l.status || l.pipeline_stage) !== "won" &&
              (l.status || l.pipeline_stage) !== "lost"
          ).length;
          return { member, count };
        });
        workloadMap.sort((a, b) => a.count - b.count);
        const bestAssignee = workloadMap[0].member;
        return assignLead(leadId, bestAssignee.id, "auto_location");
      }

      toast.error(
        `No eligible Sub Admin found covering location: ${lead.city ? `${lead.city}, ` : ""}${lead.state}. Kept in Unassigned.`
      );
      return null;
    },
    [leads, teamMembers, assignLead]
  );

  // Action: Update Lead Status & Stage
  const updateLeadStatus = useCallback(
    async (leadId, { status, pipeline_stage, notes }) => {
      try {
        const updates = {};
        if (status) updates.status = status;
        if (pipeline_stage) updates.pipeline_stage = pipeline_stage;

        const updated = await leadRepository.update(leadId, updates);

        // Log stage activity
        await activityRepository.add({
          lead_id: leadId,
          type: "status_change",
          summary: `Status updated to ${status || pipeline_stage}`,
          details: notes || `Progressed pipeline stage to: ${pipeline_stage || status}`,
          author_id: user?.id || "operator",
          author_name: user?.name || "Operator",
        });

        setLeads((prev) => prev.map((l) => (String(l.id) === String(leadId) ? updated : l)));
        toast.success("Lead status updated");
        return updated;
      } catch (err) {
        toast.error("Failed to update status");
        throw err;
      }
    },
    [user]
  );

  // Action: Schedule Follow-up
  const scheduleFollowup = useCallback(
    async (leadId, { next_followup_at, next_followup_notes }) => {
      try {
        const updated = await leadRepository.updateFollowup(leadId, {
          next_followup_at,
          next_followup_notes,
        });

        await activityRepository.add({
          lead_id: leadId,
          type: "follow_up",
          summary: `Follow-up scheduled for ${new Date(next_followup_at).toLocaleDateString()}`,
          details: next_followup_notes,
          author_id: user?.id || "operator",
          author_name: user?.name || "Operator",
        });

        setLeads((prev) => prev.map((l) => (String(l.id) === String(leadId) ? updated : l)));
        toast.success("Follow-up scheduled successfully");
        return updated;
      } catch (err) {
        toast.error("Failed to schedule follow-up");
        throw err;
      }
    },
    [user]
  );

  // Action: Log Activity
  const logActivity = useCallback(
    async (leadId, activityData) => {
      try {
        const newAct = await activityRepository.add({
          lead_id: leadId,
          author_id: user?.id || "operator",
          author_name: user?.name || "Operator",
          ...activityData,
        });
        toast.success("Activity logged to timeline");
        return newAct;
      } catch (err) {
        toast.error("Failed to record activity");
        throw err;
      }
    },
    [user]
  );

  // Action: Create Quotation
  const createQuotation = useCallback(
    async (quoteData) => {
      try {
        const newQuote = await quotationRepository.create({
          created_by: user?.id || "operator",
          created_by_name: user?.name || "Operator",
          ...quoteData,
        });

        if (quoteData.lead_id) {
          await activityRepository.add({
            lead_id: quoteData.lead_id,
            type: "quotation",
            summary: `Generated Quotation #${newQuote.quotation_number}`,
            details: `Grand Total: ₹${newQuote.grand_total?.toLocaleString("en-IN")}`,
            author_id: user?.id || "operator",
            author_name: user?.name || "Operator",
          });
          // Update lead stage to quote_sent
          await leadRepository.update(quoteData.lead_id, {
            pipeline_stage: "quote_sent",
            status: "quotation_sent",
          });
        }

        setQuotations((prev) => [newQuote, ...prev]);
        toast.success(`Quotation ${newQuote.quotation_number} generated`);
        return newQuote;
      } catch (err) {
        toast.error("Failed to generate quotation");
        throw err;
      }
    },
    [user]
  );

  // Action: Update Quotation Status
  const updateQuotationStatus = useCallback(async (quotationId, newStatus) => {
    try {
      const updated = await quotationRepository.updateStatus(quotationId, newStatus);
      setQuotations((prev) => prev.map((q) => (String(q.id) === String(quotationId) ? updated : q)));
      toast.success(`Quotation status: ${newStatus}`);
      return updated;
    } catch (err) {
      toast.error("Failed to update quotation");
      throw err;
    }
  }, []);

  // Action: Create Sub Admin with Territory & Permissions
  const createSubAdmin = useCallback(async (memberData) => {
    try {
      const created = await teamRepository.create(memberData);
      setTeamMembers((prev) => [...prev, created]);
      toast.success(`Sub Admin ${created.name} registered`);
      return created;
    } catch (err) {
      toast.error("Failed to create sub admin");
      throw err;
    }
  }, []);

  // Action: Update Sub Admin
  const updateSubAdmin = useCallback(async (memberId, updates) => {
    try {
      const updated = await teamRepository.update(memberId, updates);
      setTeamMembers((prev) => prev.map((m) => (String(m.id) === String(memberId) ? updated : m)));
      toast.success("Team member profile updated");
      return updated;
    } catch (err) {
      toast.error("Failed to update member");
      throw err;
    }
  }, []);

  // Action: Toggle Sub Admin Status
  const toggleSubAdminStatus = useCallback(async (memberId) => {
    try {
      const updated = await teamRepository.toggleStatus(memberId);
      setTeamMembers((prev) => prev.map((m) => (String(m.id) === String(memberId) ? updated : m)));
      toast.success(`Operator ${updated.name} is now ${updated.status}`);
      return updated;
    } catch (err) {
      toast.error("Failed to toggle operator status");
      throw err;
    }
  }, []);

  // Action: Delete Sub Admin
  const deleteSubAdmin = useCallback(async (memberId) => {
    try {
      await teamRepository.delete(memberId);
      setTeamMembers((prev) => prev.filter((m) => String(m.id) !== String(memberId)));
      toast.success("Team member record removed");
      return true;
    } catch (err) {
      toast.error("Failed to remove team member");
      throw err;
    }
  }, []);

  const value = {
    loading,
    leads: visibleLeads,
    allLeads: leads,
    unassignedLeads,
    quotations,
    teamMembers,
    customers,
    refreshCRM,
    assignLead,
    autoAssignLead,
    updateLeadStatus,
    scheduleFollowup,
    logActivity,
    createQuotation,
    updateQuotationStatus,
    createSubAdmin,
    updateSubAdmin,
    toggleSubAdminStatus,
    deleteSubAdmin,
    leadRepository,
    activityRepository,
    customerRepository,
    teamRepository,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

export default CRMContext;
