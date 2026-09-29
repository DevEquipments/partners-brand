import { useState, useEffect } from "react";
import {
  X,
  Phone,
  MapPin,
  User,
  Clock,
  Send,
  FileCheck,
  Building,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import ActivityTimeline from "./ActivityTimeline";
import AssignmentSelector from "./AssignmentSelector";
import {
  ENQUIRY_STATUS_CONFIG,
  QUOTE_STATUS_CONFIG,
  LEAD_STATUS,
  LEAD_PRIORITY_CONFIG,
} from "../../config/crmStatuses";
import { formatDate } from "../../utils/dateUtils";

const STATUS_STEPS = [
  { id: LEAD_STATUS.NEW, label: "New" },
  { id: LEAD_STATUS.ASSIGNED, label: "Assigned" },
  { id: LEAD_STATUS.CONTACTED, label: "Contacted" },
  { id: LEAD_STATUS.FOLLOW_UP, label: "Follow-up" },
  { id: LEAD_STATUS.WON, label: "Won" },
  { id: LEAD_STATUS.LOST, label: "Lost" },
];

export const LeadDetail = ({ isOpen, onClose, lead, onQuotationCreate }) => {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const {
    assignLead,
    autoAssignLead,
    updateLeadStatus,
    scheduleFollowup,
    logActivity,
    activityRepository,
    customerRepository,
  } = useCRM();

  const [activeTab, setActiveTab] = useState("timeline"); // timeline, customer_history, log_activity, followup
  const [activities, setActivities] = useState([]);
  const [customerData, setCustomerData] = useState(null);

  // Form states
  const [activityType, setActivityType] = useState("call");
  const [activitySummary, setActivitySummary] = useState("");
  const [activityDetails, setActivityDetails] = useState("");

  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");

  useEffect(() => {
    if (!lead) return;

    let isSubscribed = true;

    const loadLeadDetails = async () => {
      const acts = await activityRepository.getForLead(lead.id);
      let cust = null;
      if (lead.customer_id) {
        cust = await customerRepository.getCustomerWithHistory(lead.customer_id);
      }

      if (isSubscribed) {
        setActivities(acts);
        setCustomerData(cust);
      }
    };

    loadLeadDetails();

    return () => {
      isSubscribed = false;
    };
  }, [lead, activityRepository, customerRepository]);

  if (!isOpen || !lead) return null;

  const isEnquiry = lead.type === "customer_enquiry";
  const statusConfig = isEnquiry
    ? ENQUIRY_STATUS_CONFIG[lead.status] || {}
    : QUOTE_STATUS_CONFIG[lead.status] || {};
  const priorityConfig = LEAD_PRIORITY_CONFIG[lead.priority] || {};

  const handleStatusChange = async (newStatus) => {
    await updateLeadStatus(lead.id, { status: newStatus, pipeline_stage: newStatus });
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activitySummary.trim()) return;

    await logActivity(lead.id, {
      type: activityType,
      summary: activitySummary,
      details: activityDetails,
    });

    setActivitySummary("");
    setActivityDetails("");
    const freshActs = await activityRepository.getForLead(lead.id);
    setActivities(freshActs);
    setActiveTab("timeline");
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    if (!followupDate) return;

    await scheduleFollowup(lead.id, {
      next_followup_at: followupDate,
      next_followup_notes: followupNotes,
    });

    setFollowupDate("");
    setFollowupNotes("");
    const freshActs = await activityRepository.getForLead(lead.id);
    setActivities(freshActs);
    setActiveTab("timeline");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden z-10 animate-slide-in-right">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                {lead.lead_code || lead.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.badgeClass || ""}`}>
                {statusConfig.label || lead.status}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityConfig.badgeClass || ""}`}>
                {priorityConfig.label || lead.priority}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {lead.customer_name || lead.full_name || lead.name || "Customer Lead"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onQuotationCreate && (
              <button
                type="button"
                onClick={() => onQuotationCreate(lead)}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Create Quote</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lead Status Bar (6 Statuses) */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0 flex items-center gap-1">
          {STATUS_STEPS.map((step, idx) => {
            const currentStatus = (lead.status || lead.pipeline_stage || "new").toLowerCase();
            const isCurrent = currentStatus === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStatusChange(step.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  isCurrent
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <span>{idx + 1}. {step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Location & Lead Assignment Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Lead Assignment & Location
              </span>
              {isAdmin && !lead.assigned_to && (
                <button
                  type="button"
                  onClick={() => autoAssignLead(lead.id)}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  Auto-Assign by Location
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Location</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {lead.city ? `${lead.city}, ` : ""}{lead.state || "Not Specified"}
                </p>
              </div>

              <div>
                <p className="text-slate-400">Current Lead Owner</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {lead.assigned_name || (
                    <span className="text-amber-600 dark:text-amber-400">Unassigned Lead</span>
                  )}
                </p>
              </div>
            </div>

            {/* Admin Assignment Dropdown */}
            {isAdmin && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                <AssignmentSelector
                  record={lead}
                  currentAssigneeId={lead.assigned_to}
                  onAssign={async (subAdminId, assignmentType, overrideReason) => {
                    await assignLead(lead.id, subAdminId, assignmentType, overrideReason);
                  }}
                />
              </div>
            )}
          </div>

          {/* Customer & Equipment Requirement Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Requirement Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400">Contact Person</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {lead.contact_person || lead.name || lead.full_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Phone & WhatsApp</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`tel:${lead.phone || lead.phone_no || lead.mobile}`}
                    className="font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {lead.phone || lead.phone_no || lead.mobile || "-"}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-slate-400">Email Address</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {lead.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Budget Range</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {lead.budget_range || "Negotiable"}
                </p>
              </div>
            </div>

            {lead.equipment_interest && (
              <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15">
                <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">
                  Equipment Model Requested
                </p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {lead.model_name || lead.equipment_interest}
                </p>
              </div>
            )}

            {lead.message && (
              <div>
                <p className="text-slate-400">Customer Message / Inquiry Notes</p>
                <p className="mt-1 p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{lead.message}"
                </p>
              </div>
            )}
          </div>

          {/* Follow-up Status Card */}
          {lead.next_followup_at && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled Follow-up
                </span>
                <span>{new Date(lead.next_followup_at).toLocaleString()}</span>
              </div>
              {lead.next_followup_notes && (
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {lead.next_followup_notes}
                </p>
              )}
            </div>
          )}

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === "timeline"
                  ? "border-orange-600 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Activity Timeline ({activities.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("log_activity")}
              className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === "log_activity"
                  ? "border-orange-600 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Log Activity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("followup")}
              className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === "followup"
                  ? "border-orange-600 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Set Follow-up
            </button>
            {customerData && (
              <button
                type="button"
                onClick={() => setActiveTab("customer_history")}
                className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === "customer_history"
                    ? "border-orange-600 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Customer 360° History
              </button>
            )}
          </div>

          {/* Tab Content: Timeline */}
          {activeTab === "timeline" && (
            <div className="pt-2">
              <ActivityTimeline activities={activities} />
            </div>
          )}

          {/* Tab Content: Log Activity Form */}
          {activeTab === "log_activity" && (
            <form onSubmit={handleAddActivity} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Interaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "call", label: "Phone Call" },
                    { id: "whatsapp", label: "WhatsApp" },
                    { id: "email", label: "Email" },
                    { id: "site_visit", label: "Site Visit" },
                    { id: "meeting", label: "Meeting" },
                    { id: "note", label: "Note" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActivityType(t.id)}
                      className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        activityType === t.id
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discussed pricing and delivery deadline"
                  value={activitySummary}
                  onChange={(e) => setActivitySummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Detailed Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed minutes of discussion..."
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Record Activity
              </button>
            </form>
          )}

          {/* Tab Content: Set Follow-up Form */}
          {activeTab === "followup" && (
            <form onSubmit={handleScheduleFollowup} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Follow-up Objective</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Call Rajesh Sharma to confirm bank loan sanction..."
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                Schedule Follow-up
              </button>
            </form>
          )}

          {/* Tab Content: Customer 360 History */}
          {activeTab === "customer_history" && customerData && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-orange-500" />
                  {customerData.name} ({customerData.tier})
                </p>
                <p className="text-slate-500">GST: {customerData.gst || "N/A"}</p>
                <p className="text-slate-500">{customerData.address}</p>
              </div>

              {/* Related Quotes & Enquiries */}
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  All Requests from this Customer ({customerData.leads?.length || 0})
                </p>
                {customerData.leads?.map((cLead) => (
                  <div
                    key={cLead.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {cLead.lead_code} &bull; {cLead.equipment_interest || "General Equipment"}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatDate(cLead.created_at)}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cLead.pipeline_stage}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quotations */}
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Quotations Issued ({customerData.quotations?.length || 0})
                </p>
                {customerData.quotations?.map((cQuote) => (
                  <div
                    key={cQuote.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {cQuote.quotation_number} &bull; ₹{cQuote.grand_total?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400">Valid until {cQuote.valid_until}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {cQuote.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
