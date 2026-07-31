import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getPremiumBrandInquiries } from "../services/inquiryApi";
import { getProductQuotations } from "../services/productQuotation";
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  Inbox,
  MessageCircle,
  MoreHorizontal,
  Phone,
  RefreshCw,
  UserRound,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

// Set this to false when the dashboard aggregate API is ready to use in production.
const USE_DEMO_DATA = true;

const DEMO_DASHBOARD_DATA = {
  inquiries: [
    {
      id: 101,
      name: "Sharma Constructions",
      mobile: "9876543210",
      city: "Delhi",
      message: "Need an excavator for a six-month project",
      status: "new",
      created_at: "2026-07-29T09:15:00",
    },
    {
      id: 102,
      name: "Gupta Infra",
      mobile: "9988776655",
      city: "Noida",
      message: "Looking for a JCB 3DX quotation",
      status: "new",
      created_at: "2026-07-29T08:40:00",
    },
    {
      id: 103,
      name: "Mumbai Builders",
      mobile: "9111223344",
      city: "Mumbai",
      message: "Requesting availability and rental rates",
      status: "contacted",
      created_at: "2026-07-28T16:30:00",
    },
  ],
  quotations: [
    {
      id: 201,
      full_name: "Demo Constructions",
      phone_no: "9876543210",
      location: "Pune",
      model_name: "JCB 3DX Backhoe Loader",
      amount: 3500000,
      status: "pending",
      follow_up_date: "2026-07-29",
      created_at: "2026-07-28T11:20:00",
    },
    {
      id: 202,
      full_name: "Test Industries",
      phone_no: "1234567890",
      location: "Ahmedabad",
      model_name: "JCB Straight Concrete Bucket",
      amount: 125000,
      status: "new",
      created_at: "2026-07-27T15:45:00",
    },
    {
      id: 203,
      full_name: "RK Earthmovers",
      phone_no: "9988445522",
      location: "Jaipur",
      model_name: "JCB 140X Excavator",
      amount: 4200000,
      status: "contacted",
      follow_up_date: "2026-07-30",
      created_at: "2026-07-27T10:30:00",
    },
  ],
  inquiryTotal: 18,
  quotationTotal: 7,
  leadVolume: [
    { label: "Thu", value: 1 },
    { label: "Fri", value: 2 },
    { label: "Sat", value: 1 },
    { label: "Sun", value: 1 },
    { label: "Mon", value: 4 },
    { label: "Tue", value: 3 },
    { label: "Today", value: 6 },
  ],
};

const statusStyle = {
  new: "border-orange-200 bg-orange-50 text-orange-700",
  contacted: "border-sky-200 bg-sky-50 text-sky-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  default: "border-slate-200 bg-slate-50 text-slate-600",
};

const getStatus = (value) => String(value || "new").toLowerCase();
const titleCase = (value) =>
  String(value || "New").replace(/\b\w/g, (letter) => letter.toUpperCase());
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "—";
const formatCurrency = (value) =>
  value === null || value === undefined || value === ""
    ? "Amount not set"
    : `₹${Number(value).toLocaleString("en-IN")}`;

const buildLeadVolume = (leads) => {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return {
      key: date.toISOString().slice(0, 10),
      label:
        offset === 6
          ? "Today"
          : new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      value: 0,
    };
  });
  leads.forEach((lead) => {
    const match = days.find(
      (item) => item.key === String(lead.created_at || "").slice(0, 10),
    );
    if (match) match.value += 1;
  });
  return days;
};

const Card = ({ children, className = "" }) => (
  <section
    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,.04)] ${className}`}
  >
    {children}
  </section>
);

const Badge = ({ children, status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle[getStatus(status)] || statusStyle.default}`}
  >
    {children}
  </span>
);

const CardHeader = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
    <div>
      <h2 className="text-[15px] font-bold tracking-[-.01em] text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
    {action}
  </div>
);

// New Compact Admin Metric Card Component
const AdminMetricCard = ({
  icon: Icon,
  title,
  description,
  primaryMetric,
  primaryLabel,
  secondaryMetrics,
  onClick,
  tone = "orange",
}) => {
  const toneClasses = {
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-600",
      icon: "text-orange-500",
      hover: "hover:bg-orange-100",
    },
    blue: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-600",
      icon: "text-sky-500",
      hover: "hover:bg-sky-100",
    },
  }[tone];

  return (
    <button
      // onClick={onClick}
      className={`group relative w-full rounded-xl border bg-white p-3 text-left shadow-[0_1px_3px_rgba(15,23,42,.06)] ring-1 ring-slate-200/70 transition-all duration-300 hover:shadow-[0_8px_16px_rgba(15,23,42,.1)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${toneClasses.text}`}
    >
      {/* Top Row: Icon + Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`flex-shrink-0 h-8 w-8 rounded-lg ${toneClasses.bg} border ${toneClasses.border} grid place-items-center ${toneClasses.hover} transition`}
            >
              <Icon className={`h-4 w-4 ${toneClasses.icon}`} />
            </span>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {title}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Primary Metric - Prominent */}
      <div className="mb-2.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
          {primaryLabel}
        </p>
        <p
          className={`text-2xl font-black leading-tight tracking-[-.06em] ${toneClasses.text}`}
        >
          {primaryMetric}
        </p>
      </div>

      {/* Secondary Metrics - Inline Compact */}
      {secondaryMetrics && secondaryMetrics.length > 0 && (
        <div className="flex gap-3 pt-1.5 border-t border-slate-100 items-center">
          {secondaryMetrics.map((metric, idx) => (
            <div key={idx} className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                {metric.label}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-base font-bold text-slate-800">
                  {metric.value}
                </p>
                {metric.badge && (
                  <Badge status={metric.badge}>{titleCase(metric.badge)}</Badge>
                )}
              </div>
            </div>
          ))}

          {/* Redirect to link */}
          <div className="flex items-center text-orange-500 hover:text-slate-700">
            <button
              onClick={onClick}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle hover indicator */}
      <div
        className="absolute top-0 right-0 w-1 h-1 bg-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "12px", right: "12px" }}
      />
    </button>
  );
};

const EmptyState = ({ title, detail, action }) => (
  <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
      <Inbox className="h-5 w-5" />
    </span>
    <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{detail}</p>
    {action}
  </div>
);

const LoadingRows = () => (
  <div className="animate-pulse divide-y divide-slate-100">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 px-5 py-4 sm:px-6">
        <span className="h-10 w-10 rounded-full bg-slate-100" />
        <span className="flex-1 space-y-2">
          <span className="block h-3 w-32 rounded bg-slate-100" />
          <span className="block h-2.5 w-48 rounded bg-slate-100" />
        </span>
        <span className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

const LeadRow = ({ lead, onOpen }) => {
  const name = lead.name || lead.customer_name || "Unnamed customer";
  const phone = lead.mobile || lead.phone || lead.phone_no;
  const status = getStatus(lead.status);
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
        {initials(name)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-slate-800">
            {name}
          </p>
          <Badge status={status}>{titleCase(status)}</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">
          {lead.message || lead.product_name || "Customer inquiry"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span>{phone || "Phone unavailable"}</span>
          {lead.city && <span>{lead.city}</span>}
          <span>{formatDate(lead.created_at)}</span>
        </div>
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:justify-end">
        <a
          href={phone ? `tel:${phone}` : undefined}
          onClick={(event) => !phone && event.preventDefault()}
          aria-label={`Call ${name}`}
          className={`grid h-8 w-8 place-items-center rounded-lg border transition ${phone ? "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600" : "cursor-not-allowed border-slate-100 text-slate-300"}`}
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
        <a
          href={
            phone
              ? `https://wa.me/91${String(phone).replace(/\D/g, "")}`
              : undefined
          }
          target="_blank"
          rel="noreferrer"
          onClick={(event) => !phone && event.preventDefault()}
          aria-label={`WhatsApp ${name}`}
          className={`grid h-8 w-8 place-items-center rounded-lg border transition ${phone ? "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600" : "cursor-not-allowed border-slate-100 text-slate-300"}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={onOpen}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          Open <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const QuoteRow = ({ quote, onOpen }) => {
  const name = quote.full_name || quote.customer_name || "Unnamed customer";
  const product = quote.model_name || quote.product || "Product not specified";
  const status = getStatus(quote.status);
  const amount = quote.amount ?? quote.quoted_amount ?? quote.price;
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-slate-800">
            {name}
          </p>
          <Badge status={status}>{titleCase(status)}</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-slate-500">{product}</p>
        <p className="mt-2 text-[11px] text-slate-400">
          Created {formatDate(quote.created_at)}
        </p>
      </div>
      <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:block sm:text-right">
        <p className="text-[13px] font-bold text-slate-800">
          {formatCurrency(amount)}
        </p>
        <button
          onClick={onOpen}
          className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          Open quote <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const LeadVolumeChart = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div
      className="px-5 pb-2 pt-4 sm:px-6 h-full flex flex-col"
      role="img"
      aria-label="Daily inquiry volume for the last seven days"
    >
      <div className="mb-3 flex items-end justify-between flex-shrink-0">
        <div>
          <p className="text-[15px] font-bold text-slate-900">
            Incoming inquiries
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Last 7 days</p>
        </div>
        <button
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 flex-shrink-0"
          aria-label="More inquiry chart options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 items-end gap-2 border-b border-slate-200 pb-1 min-h-40">
        {data.map((item) => (
          <div
            key={item.label}
            className="group flex h-full flex-1 flex-col justify-end"
          >
            <span className="mb-1 text-center text-[11px] font-semibold text-slate-600 opacity-0 transition group-hover:opacity-100">
              {item.value}
            </span>
            <div
              className="min-h-1 rounded-t-md bg-orange-400 transition-all duration-500 group-hover:bg-orange-500"
              style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }}
            />
            <span className="mt-2 text-center text-[10px] font-medium text-slate-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBreakdown = ({ counts, total }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const entries = [
    {
      label: "New",
      value: counts.new || 0,
      color: "bg-orange-500",
      lightBg: "bg-orange-100",
    },
    {
      label: "Contacted",
      value: counts.contacted || 0,
      color: "bg-sky-500",
      lightBg: "bg-sky-100",
    },
    {
      label: "Resolved",
      value: counts.resolved || 0,
      color: "bg-emerald-500",
      lightBg: "bg-emerald-100",
    },
  ];

  const getPercentage = (value) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-5">
      <style>{`
        @keyframes pulse-bar { 
          0%, 100% { opacity: 1 } 
          50% { opacity: 0.7 } 
        }
        .status-bar-hover { animation: pulse-bar 1.5s ease-in-out infinite; }
      `}</style>

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[15px] font-bold text-slate-900">Lead Status</p>
          <p className="mt-0.5 text-xs text-slate-500">Distribution overview</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black tracking-[-.05em] text-slate-900">
            {total}
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            Total Leads
          </p>
        </div>
      </div>

      {/* Interactive Status Bars */}
      <div className="space-y-2.5">
        {entries.map((item) => {
          const percentage = getPercentage(item.value);
          const isHovered = hoveredStatus === item.label;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredStatus(item.label)}
              onMouseLeave={() => setHoveredStatus(null)}
              className="cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.color} transition-all duration-200 ${isHovered ? "scale-150" : ""}`}
                  />
                  <p
                    className={`text-sm font-semibold transition-colors ${isHovered ? "text-slate-900" : "text-slate-600"}`}
                  >
                    {item.label}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold transition-all duration-200 ${isHovered ? "text-slate-900" : "text-slate-700"}`}
                  >
                    {item.value}
                  </p>
                  <p
                    className={`text-[10px] font-semibold transition-all duration-200 leading-tight ${isHovered ? item.color.replace("bg-", "text-") : "text-slate-400"}`}
                  >
                    {percentage}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className={`h-1.5 rounded-full overflow-hidden transition-all duration-200 ${item.lightBg} ${isHovered ? "ring-2 ring-offset-1" : ""}`}
                style={{ ringColor: item.color }}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color} ${isHovered ? "status-bar-hover shadow-lg" : ""} ${isHovered ? item.color.replace("bg-", "shadow-") + "-500/50" : ""}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
        {entries.map((item) => (
          <div
            key={item.label}
            className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${hoveredStatus === item.label ? item.lightBg + " ring-1 ring-offset-1" : "hover:" + item.lightBg}`}
            onMouseEnter={() => setHoveredStatus(item.label)}
            onMouseLeave={() => setHoveredStatus(null)}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
            <p
              className={`text-base font-black tracking-[-.03em] transition-colors ${hoveredStatus === item.label ? item.color.replace("bg-", "text-") : "text-slate-900"}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    inquiries: [],
    quotations: [],
    inquiryTotal: 0,
    quotationTotal: 0,
    leadVolume: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const brandId = user?.brand_id || user?.brand_slug || "jcb";
  const partnerName =
    user?.brand_name || user?.name || user?.username || "Partner";

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      try {
        if (USE_DEMO_DATA) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, isRefresh ? 350 : 600),
          );
          setData(DEMO_DASHBOARD_DATA);
          return;
        }
        const [inquiryResponse, quotationResponse] = await Promise.all([
          getPremiumBrandInquiries({ brand_id: brandId, page: 1, token }),
          getProductQuotations({ brand_id: brandId, page: 1, token }),
        ]);
        setData({
          inquiries: inquiryResponse?.data || [],
          quotations: quotationResponse?.data || [],
          inquiryTotal:
            inquiryResponse?.total_records ?? inquiryResponse?.total ?? 0,
          quotationTotal:
            quotationResponse?.total_records ?? quotationResponse?.total ?? 0,
          leadVolume: buildLeadVolume(inquiryResponse?.data || []),
        });
      } catch (requestError) {
        setError(
          requestError?.message ||
            "We could not load your work queues. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [brandId, token],
  );

  useEffect(() => {
    const requestTimer = window.setTimeout(() => loadDashboard(), 0);
    return () => window.clearTimeout(requestTimer);
  }, [loadDashboard]);

  const work = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const newToday = data.inquiries.filter(
      (item) => String(item.created_at || "").slice(0, 10) === todayKey,
    );
    const pendingQuotes = data.quotations.filter(
      (item) =>
        !["resolved", "completed", "cancelled"].includes(
          getStatus(item.status),
        ),
    );
    const leadStatuses = data.inquiries.reduce((counts, item) => {
      const status = getStatus(item.status);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    return { newToday, pendingQuotes, leadStatuses };
  }, [data]);

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 pb-8 text-slate-900">
      <style>{`@keyframes dashboard-enter { from { opacity: 0; transform: translateY(7px) } to { opacity: 1; transform: translateY(0) } } .dashboard-enter { animation: dashboard-enter .35s ease-out both; }`}</style>
      <header className="dashboard-enter flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Partner Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-600">Dashboard</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-[-.035em] text-slate-950 sm:text-[28px]">
            Welcome back, {partnerName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(249,115,22,.2)] transition hover:bg-orange-600"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </button>
        </div>
      </header>

      {/* {USE_DEMO_DATA && (
        <div className="dashboard-enter flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong>Demo mode</strong> · status changes reset on refresh.
          </span>
        </div>
      )} */}

      {error ? (
        <Card className="dashboard-enter border-red-200">
          <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
                <CircleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Dashboard could not be updated
                </p>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadDashboard()}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Try again
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* REDESIGNED ADMIN METRIC CARDS */}
          <section
            className="dashboard-enter grid gap-4 md:grid-cols-2"
            style={{ animationDelay: "50ms" }}
          >
            <AdminMetricCard
              icon={Users}
              title="Customer Inquiries"
              description="Active lead management"
              primaryMetric={loading ? "—" : data.inquiryTotal}
              primaryLabel="Total Inquiries"
              secondaryMetrics={
                loading
                  ? []
                  : [
                      {
                        label: "New Today",
                        value: work.newToday.length,
                        badge: "new",
                      },
                      {
                        label: "Contacted",
                        value: work.leadStatuses.contacted || 0,
                        badge: "contacted",
                      },
                      {
                        // label: "Resolved",
                        link: "/inquiries",
                      },
                    ]
              }
              tone="orange"
              onClick={() => navigate("/inquiries")}
            />
            <AdminMetricCard
              icon={FileText}
              title="Product Quotations"
              description="Quote request tracking"
              primaryMetric={loading ? "—" : data.quotationTotal}
              primaryLabel="Total Quotations"
              secondaryMetrics={
                loading
                  ? []
                  : [
                      {
                        label: "Pending",
                        value: work.pendingQuotes.length,
                        badge: "pending",
                      },
                      {
                        label: "Follow-up Due",
                        value: data.quotations.filter((q) => q.follow_up_date)
                          .length,
                      },
                    ]
              }
              tone="blue"
              onClick={() => navigate("/product-quotes")}
            />
          </section>

          <section
            className="dashboard-enter grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]"
            style={{ animationDelay: "90ms" }}
          >
            <Card>
              <LeadVolumeChart data={loading ? [] : data.leadVolume} />
            </Card>
            <Card>
              <StatusBreakdown
                counts={work.leadStatuses}
                total={loading ? 0 : data.inquiries.length}
              />
            </Card>
          </section>

          <section
            className="dashboard-enter grid gap-5 xl:grid-cols-2"
            style={{ animationDelay: "150ms" }}
          >
            <Card>
              <CardHeader
                title="Recent customer inquiries"
                description={
                  USE_DEMO_DATA
                    ? "Demo leads for testing daily partner actions"
                    : "Latest records from the inquiry API"
                }
                action={
                  <button
                    onClick={() => navigate("/inquiries")}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
              {loading ? (
                <LoadingRows />
              ) : data.inquiries.length ? (
                <div className="divide-y divide-slate-100">
                  {data.inquiries.slice(0, 5).map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onOpen={() => navigate("/inquiries")}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No inquiries yet"
                  detail="New customer inquiries will appear here as soon as they arrive."
                  action={
                    <button
                      onClick={() => navigate("/inquiries")}
                      className="mt-4 text-xs font-semibold text-orange-600"
                    >
                      Open inquiries
                    </button>
                  }
                />
              )}
            </Card>
            <Card>
              <CardHeader
                title="Recent product requests"
                description="Latest records from the quotation API"
                action={
                  <button
                    onClick={() => navigate("/product-quotes")}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
              {loading ? (
                <LoadingRows />
              ) : data.quotations.length ? (
                <div className="divide-y divide-slate-100">
                  {data.quotations.slice(0, 5).map((quote) => (
                    <QuoteRow
                      key={quote.id}
                      quote={quote}
                      onOpen={() => navigate("/product-quotes")}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No quotation requests yet"
                  detail="Equipment quotation requests will appear here when customers submit them."
                  action={
                    <button
                      onClick={() => navigate("/product-quotes")}
                      className="mt-4 text-xs font-semibold text-orange-600"
                    >
                      Open quotations
                    </button>
                  }
                />
              )}
            </Card>
          </section>
        </>
      )}
    </main>
  );
};

export default Dashboard;
