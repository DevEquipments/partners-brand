import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  MessageSquareText,
  FileSpreadsheet,
  Clock,
  Inbox,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { getDashboardData } from "../services/dashboardApi";
import { useBrand } from "../hooks/useBrand";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";
import { useCRM } from "../context/CRMContext";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import { CardSkeleton, TableSkeleton } from "../components/common/Skeletons";
import { getApiErrorMessage } from "../utils/errorHandler";
import { formatDate } from "../utils/dateUtils";
import { getLeadStatusBadge } from "../config/crmStatuses";

export const Dashboard = () => {
  const { brandId, brandName } = useBrand();
  const { role, user } = useAuth();
  const { hasPermission } = usePermissions();
  const { allLeads, refreshCRM } = useCRM();
  const navigate = useNavigate();

  const isAdmin = role === "ADMIN";

  const [dashboardData, setDashboardData] = useState({
    customerQuotesCount: 0,
    featureQuotesCount: 0,
    customerEnquiries: [],
    featureQuotes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const response = await getDashboardData({ brand_id: brandId });
        const raw = response?.data || response || {};

        setDashboardData({
          customerQuotesCount: Number(raw.customer_quotes_count || 0),
          featureQuotesCount: Number(raw.feature_quotes_count || 0),
          customerEnquiries: Array.isArray(raw.customer_enquiry) ? raw.customer_enquiry : [],
          featureQuotes: Array.isArray(raw.feature_products_enquiry)
            ? raw.feature_products_enquiry
            : [],
        });
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Could not retrieve dashboard metrics. Please check network connection."
        );
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [brandId]
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Handle combined manual refresh
  const handleFullRefresh = async () => {
    await Promise.all([loadData(true), refreshCRM()]);
  };

  // Permission checks
  const canViewQuotes = hasPermission(PERMISSIONS.QUOTES_VIEW);

  // Filtered operational lists based on role
  const relevantLeads = useMemo(() => {
    if (isAdmin) return allLeads;
    return allLeads.filter((l) => String(l.assigned_to) === String(user?.id));
  }, [isAdmin, allLeads, user]);

  const newLeadsCount = useMemo(() => {
    return relevantLeads.filter((l) => (l.status || l.pipeline_stage || "new") === "new").length;
  }, [relevantLeads]);

  const enquiriesCount = useMemo(() => {
    if (isAdmin) {
      return dashboardData.customerQuotesCount || allLeads.filter((l) => l.type === "customer_enquiry").length;
    }
    return relevantLeads.filter((l) => l.type === "customer_enquiry").length;
  }, [isAdmin, dashboardData, allLeads, relevantLeads]);

  const quotesCount = useMemo(() => {
    if (isAdmin) {
      return dashboardData.featureQuotesCount || allLeads.filter((l) => l.type === "equipment_quote").length;
    }
    return relevantLeads.filter((l) => l.type === "equipment_quote").length;
  }, [isAdmin, dashboardData, allLeads, relevantLeads]);

  const unassignedCount = useMemo(() => {
    return allLeads.filter((l) => !l.assigned_to).length;
  }, [allLeads]);

  const followupsDueCount = useMemo(() => {
    return relevantLeads.filter((l) => l.next_followup_at).length;
  }, [relevantLeads]);

  const wonCount = useMemo(() => {
    return relevantLeads.filter((l) => (l.status || l.pipeline_stage) === "won").length;
  }, [relevantLeads]);

  const lostCount = useMemo(() => {
    return relevantLeads.filter((l) => (l.status || l.pipeline_stage) === "lost").length;
  }, [relevantLeads]);

  // Today's Follow-ups
  const todayFollowups = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return relevantLeads
      .filter((l) => l.next_followup_at && l.next_followup_at.slice(0, 10) <= todayStr)
      .slice(0, 6);
  }, [relevantLeads]);

  // Recent Leads
  const recentLeads = useMemo(() => {
    return [...relevantLeads]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [relevantLeads]);

  // Recent Enquiries (Backend + Local CRM)
  const recentEnquiries = useMemo(() => {
    if (dashboardData.customerEnquiries.length > 0) {
      return dashboardData.customerEnquiries.slice(0, 5);
    }
    return relevantLeads.filter((l) => l.type === "customer_enquiry").slice(0, 5);
  }, [dashboardData.customerEnquiries, relevantLeads]);

  // Recent Quotes (Backend + Local CRM)
  const recentQuotes = useMemo(() => {
    if (dashboardData.featureQuotes.length > 0) {
      return dashboardData.featureQuotes.slice(0, 5);
    }
    return relevantLeads.filter((l) => l.type === "equipment_quote").slice(0, 5);
  }, [dashboardData.featureQuotes, relevantLeads]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title={isAdmin ? "Operations Dashboard" : "My Operations Dashboard"}
        subtitle={
          isAdmin
            ? `Commercial management and lead operations workspace for ${brandName}`
            : `Assigned leads, quotes, and customer follow-ups for ${user?.name || "Operator"}`
        }
        breadcrumbs={[{ label: "Overview" }, { label: "Dashboard" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={handleFullRefresh}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <CardSkeleton count={isAdmin ? 7 : 5} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <TableSkeleton rows={5} cols={5} />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Strip (Admin: 7 Cards, Sub Admin: 5/6 Cards) */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 ${
              isAdmin ? "lg:grid-cols-7" : canViewQuotes ? "lg:grid-cols-6" : "lg:grid-cols-5"
            } gap-3`}
          >
            {/* Card: Leads / New Leads */}
            <div
              onClick={() => navigate("/crm/leads")}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {isAdmin ? "New Leads" : "My Leads"}
                </span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {isAdmin ? newLeadsCount : relevantLeads.length}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Card: Enquiries */}
            <div
              onClick={() => navigate("/crm/enquiries")}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {isAdmin ? "Enquiries" : "My Enquiries"}
                </span>
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                  <MessageSquareText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {enquiriesCount}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Card: Quotes (Permission gated for Sub Admin) */}
            {(isAdmin || canViewQuotes) && (
              <div
                onClick={() => navigate("/crm/quotes")}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {isAdmin ? "Quotes" : "My Quotes"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {quotesCount}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            )}

            {/* Card: Follow-ups Due */}
            <div
              onClick={() => navigate("/crm/follow-ups")}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  Follow-ups
                </span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {followupsDueCount}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Card: Unassigned (Admin Only) */}
            {isAdmin && (
              <div
                onClick={() => navigate("/crm/leads")}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    Unassigned
                  </span>
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
                    <Inbox className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-red-600 dark:text-red-400">
                    {unassignedCount}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            )}

            {/* Card: Won */}
            <div
              onClick={() => navigate("/crm/leads")}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  Deals Won
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {wonCount}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Card: Lost */}
            <div
              onClick={() => navigate("/crm/leads")}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  Deals Lost
                </span>
                <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-500">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-600 dark:text-slate-400">
                  {lostCount}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Operational Tables Grid (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Table 1: Recent Leads / My Recent Leads */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isAdmin ? "Recent Leads" : "My Recent Leads"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/crm/leads")}
                  className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {recentLeads.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No leads available.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {recentLeads.map((lead) => {
                    const statusBadge = getLeadStatusBadge(lead.status || lead.pipeline_stage);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => navigate("/crm/leads")}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                              {lead.customer_name}
                            </span>
                            <span className="font-mono text-[10px] text-orange-600 dark:text-orange-400">
                              {lead.lead_code || lead.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="truncate">{lead.equipment_interest || "Machinery"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {lead.city || lead.state || "India"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${statusBadge.badgeClass}`}
                          >
                            {statusBadge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {formatDate(lead.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Table 2: Follow-ups Due Today */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isAdmin ? "Pending Follow-ups" : "Today's Follow-ups"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/crm/follow-ups")}
                  className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {todayFollowups.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No overdue or scheduled follow-ups for today.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {todayFollowups.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => navigate("/crm/follow-ups")}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate">
                          {lead.customer_name}
                        </span>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                          {lead.next_followup_notes || "Customer follow-up"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
                          {formatDate(lead.next_followup_at)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {lead.assigned_name ? `@${lead.assigned_name}` : "Unassigned"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table 3: Recent Customer Enquiries */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isAdmin ? "Recent Customer Enquiries" : "My Recent Enquiries"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/crm/enquiries")}
                  className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {recentEnquiries.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No enquiries found.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {recentEnquiries.map((enq, idx) => (
                    <div
                      key={enq.id || idx}
                      onClick={() => navigate("/crm/enquiries")}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white block truncate">
                          {enq.name || enq.customer_name || "Customer Inquiry"}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {enq.email || enq.phone || enq.city || "Direct Inquiry"}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDate(enq.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table 4: Recent Equipment Quotes (Only if permitted) */}
            {(isAdmin || canViewQuotes) && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {isAdmin ? "Recent Equipment Quotes" : "My Recent Quotes"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/crm/quotes")}
                    className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {recentQuotes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No quotes available.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {recentQuotes.map((quote, idx) => (
                      <div
                        key={quote.id || idx}
                        onClick={() => navigate("/crm/quotes")}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-white block truncate">
                            {quote.name || quote.customer_name || quote.contact_person || "Equipment Quote"}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {quote.product_name || quote.model_name || quote.equipment_interest || "Machinery Quote"}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(quote.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;