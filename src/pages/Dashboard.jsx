import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquareText,
  FileText,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Layers,
} from "lucide-react";
import { getDashboardData } from "../services/dashboardApi";
import { useBrand } from "../hooks/useBrand";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { formatDate } from "../utils/formatters";

export const Dashboard = () => {
  const { brandId, brandName } = useBrand();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    customerQuotesCount: 0,
    featureQuotesCount: 0,
    customerEnquiries: [],
    featureQuotes: [],
    incomingEnquiries: [],
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
          incomingEnquiries: Array.isArray(raw.incoming_enquiries)
            ? raw.incoming_enquiries
            : [],
        });
      } catch (err) {
        const message =
          err?.message ||
          err?.response?.data?.message ||
          "Could not retrieve dashboard metrics. Please check network connection.";
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

  // Max value for the incoming volume bar chart
  const maxCount = Math.max(
    ...dashboardData.incomingEnquiries.map((item) => Number(item.count || 0)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Enterprise Operations Header */}
      <PageHeader
        title="Operations Dashboard"
        subtitle={`Real-time equipment inquiry feed & quotation overview for ${brandName}`}
        breadcrumbs={[{ label: "Operations" }, { label: "Dashboard" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            isLoading={isRefreshing}
            onClick={() => loadData(true)}
          >
            Refresh Feed
          </Button>
        }
      />

      {error ? (
        <ErrorState
          title="Dashboard Unavailable"
          message={error}
          onRetry={() => loadData(false)}
        />
      ) : isLoading ? (
        <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <LoadingState text="Loading real-time brand operations metrics..." />
        </div>
      ) : (
        <>
          {/* Top Enterprise Metric Strip (Dense, High-Contrast) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hasPermission(PERMISSIONS.ENQUIRIES_VIEW) && (
              <div
                onClick={() => navigate("/inquiries")}
                className="group relative p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-500/60 dark:hover:border-orange-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <MessageSquareText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Customer Enquiries
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    {dashboardData.customerQuotesCount.toLocaleString("en-IN")}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total recorded
                  </span>
                </div>
              </div>
            )}

            {hasPermission(PERMISSIONS.QUOTES_VIEW) && (
              <div
                onClick={() => navigate("/product-quotes")}
                className="group relative p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Feature Equipment Quotes
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    {dashboardData.featureQuotesCount.toLocaleString("en-IN")}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Direct RFQs
                  </span>
                </div>
              </div>
            )}

            {/* Operational Channel Summary */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Brand Operations Gateway
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Direct OEM Connection
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Active Brand ID:
                </span>
                <span className="font-mono font-bold uppercase text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {brandId || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Velocity Chart (Strictly Real Data) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Incoming Enquiries Velocity
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Aggregated inquiry distribution received from customer touchpoints
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>Verified Volume</span>
              </div>
            </div>

            {dashboardData.incomingEnquiries.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No enquiry activity available"
                description="Daily inquiry activity trends will automatically render here as customer requirements arrive."
              />
            ) : (
              <div className="pt-4 pb-2">
                <div className="flex items-end justify-between gap-3 sm:gap-6 h-44 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {dashboardData.incomingEnquiries.map((item, index) => {
                    const count = Number(item.count || 0);
                    const percentage = Math.max((count / maxCount) * 100, 5);

                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center justify-end h-full group"
                      >
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                        <div
                          className="w-full max-w-[32px] bg-orange-600 hover:bg-orange-500 rounded-t transition-all duration-200 shadow-2xs"
                          style={{ height: `${percentage}%` }}
                        />
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                          {item.day || `Day ${index + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Real Recent Records Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Enquiries Queue */}
            {hasPermission(PERMISSIONS.ENQUIRIES_VIEW) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-orange-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Recent Customer Enquiries
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/inquiries")}
                    className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {dashboardData.customerEnquiries.length === 0 ? (
                    <EmptyState
                      icon={MessageSquareText}
                      title="No customer enquiries yet"
                      description="Inbound requirements submitted on your equipment models will appear here in real-time."
                    />
                  ) : (
                    dashboardData.customerEnquiries.slice(0, 5).map((enquiry) => (
                      <div
                        key={enquiry.id}
                        onClick={() => navigate("/inquiries")}
                        className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {enquiry.name || "Customer Lead"}
                            </span>
                            <StatusBadge status="new" size="xs" />
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-1 font-normal">
                            {enquiry.message || "Customer request submitted via portal."}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {enquiry.mobile && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{enquiry.mobile}</span>
                              </span>
                            )}
                            {enquiry.email && (
                              <span className="flex items-center gap-1 truncate max-w-[180px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate">{enquiry.email}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                          {formatDate(enquiry.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Feature Equipment Quotes Queue */}
            {hasPermission(PERMISSIONS.QUOTES_VIEW) && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Recent Feature Equipment Quotes
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/product-quotes")}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {dashboardData.featureQuotes.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No feature equipment quotes yet"
                      description="Direct quotation requests generated from featured equipment showcases will appear here."
                    />
                  ) : (
                    dashboardData.featureQuotes.slice(0, 5).map((quote) => (
                      <div
                        key={quote.id}
                        onClick={() => navigate("/product-quotes")}
                        className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {quote.full_name || quote.name || "Commercial Buyer"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 truncate">
                              {quote.model_name || "Heavy Machinery"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {quote.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{quote.location}</span>
                              </span>
                            )}
                            {quote.phone_no && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{quote.phone_no}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                          {formatDate(quote.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;