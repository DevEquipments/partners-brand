import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Phone,
  Mail,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Inbox,
  X,
  Download,
  CheckSquare,
  Square,
  CheckCircle2,
  SlidersHorizontal,
  Users,
  AlertCircle,
  ArrowRight,
  FileText,
  MapPin,
  Briefcase,
  Wrench,
  Package,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";
import { getProductQuotations } from "../services/productQuotation";

// ─── API ──────────────────────────────────────────────────────────────────────
// const fetchFeatureEquipmentQuotes = async ({ brand_id, page = 1, token }) => {
//   const form = new FormData();
//   form.append("brand_id", brand_id);
//   form.append("page", page);
//   const res = await fetch(
//     "https://partners.equipmentsdekho.com/apis/api/get-feature-equipment-quotes",
//     {
//       method: "POST",
//       headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
//       body: form,
//     },
//   );
//   if (!res.ok) throw new Error(`${res.status}`);
//   return res.json();
// };

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = [
  {
    value: "new",
    label: "New",
    dot: "bg-blue-500",
    rowBorder: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    ring: "ring-blue-200",
    header: "from-blue-50 to-blue-100/60 border-blue-200",
  },
  {
    value: "contacted",
    label: "Contacted",
    dot: "bg-amber-500",
    rowBorder: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "ring-amber-200",
    header: "from-amber-50 to-amber-100/60 border-amber-200",
  },
  {
    value: "resolved",
    label: "Resolved",
    dot: "bg-emerald-500",
    rowBorder: "border-l-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-200",
    header: "from-emerald-50 to-emerald-100/60 border-emerald-200",
  },
];

const ROLE_MAP = {
  contractor: "Contractor",
  "builder/developer": "Builder/Developer",
  infrastructure_company: "Infrastructure Co.",
  mining_company: "Mining Co.",
  rental_company: "Rental Co.",
  "government/psu": "Govt/PSU",
  "individual/other": "Individual",
};

const getStatus = (val) => STATUSES.find((s) => s.value === val) || STATUSES[0];
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
const fmtRole = (r = "") => ROLE_MAP[r?.toLowerCase()] || r;

const exportCSV = (rows) => {
  const h = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Product ID",
    "Brand",
    "Model",
    "Brand ID",
    "Location",
    "Role",
    "Status",
    "Received",
  ];
  const lines = rows.map((r) =>
    [
      r.id,
      r.full_name,
      r.email,
      r.phone_no,
      r.product_id,
      r.brand_name,
      r.model_name,
      r.brand_id,
      r.location,
      r.role,
      r.status || "new",
      r.created_at,
    ].join(","),
  );
  const blob = new Blob([[h.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `feature_quotes_${Date.now()}.csv`;
  a.click();
};

// ─── Product image thumbnail ──────────────────────────────────────────────────
const ProductThumb = ({ src, alt, size = "sm" }) => {
  const [err, setErr] = useState(false);
  const sz = size === "md" ? "w-14 h-14" : "w-9 h-9";
  if (!src || err)
    return (
      <div
        className={`${sz} rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0`}
      >
        <Wrench className="w-4 h-4 text-slate-300" />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className={`${sz} rounded-xl object-cover border border-slate-200 shrink-0`}
    />
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, status, size = "sm" }) => {
  const s = getStatus(status);
  const sz = size === "md" ? "w-10 h-10 text-[11px]" : "w-8 h-8 text-[10px]";
  return (
    <div
      className={`relative ${sz} rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0`}
    >
      {getInitials(name)}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${s.dot} ring-2 ring-white`}
      />
    </div>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ─── Role badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
    <Briefcase className="w-2.5 h-2.5" />
    {fmtRole(role)}
  </span>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
    <div className="w-4 h-4 rounded bg-slate-100 shrink-0" />
    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
    <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-slate-200 rounded w-28" />
      <div className="h-2 bg-slate-100 rounded w-44" />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-14 hidden md:block" />
  </div>
);

// ─── Quote row ────────────────────────────────────────────────────────────────
const QuoteRow = ({ quote, onClick, isSelected, isChecked, onCheck }) => {
  const s = getStatus(quote.status);
  return (
    <div
      onClick={() => onClick(quote)}
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 cursor-pointer
        transition-colors duration-100 select-none border-l-[3px] ${s.rowBorder}
        ${isSelected ? "bg-orange-50" : "bg-white hover:bg-slate-50"}`}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCheck(quote.id);
        }}
        className="shrink-0 text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
      >
        {isChecked ? (
          <CheckSquare className="w-4 h-4 text-orange-500" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>

      {/* Avatar */}
      <Avatar name={quote.full_name} status={quote.status} />

      {/* Product image */}
      <ProductThumb
        src={quote.image}
        alt={`${quote.brand_name} ${quote.model_name}`}
      />

      {/* Name + product */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p
            className={`text-[13px] font-semibold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}
          >
            {quote.full_name}
          </p>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">
            #{quote.id}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-orange-600 truncate">
            {quote.brand_name} {quote.model_name}
          </span>
          {quote.location && (
            <>
              <span className="text-slate-200 text-[10px]">·</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {quote.location}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Role */}
      {quote.role && (
        <div className="hidden md:block shrink-0">
          <RoleBadge role={quote.role} />
        </div>
      )}

      {/* Status */}
      <div className="hidden lg:block shrink-0">
        <StatusBadge status={quote.status} />
      </div>

      {/* Date */}
      <span className="text-[10px] text-slate-300 shrink-0 whitespace-nowrap hidden xl:block">
        {quote.created_at?.split(" ")[0]}
      </span>

      <ArrowRight
        className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-orange-400" : "text-slate-200"}`}
      />
    </div>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ quote, onClose, onStatusChange }) => {
  if (!quote)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No inquiry selected
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Select a row to view details
        </p>
      </div>
    );

  const s = getStatus(quote.status);

  return (
    <div className="flex flex-col h-full">
      {/* Status-tinted header */}
      <div
        className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r border-b ${s.header} shrink-0`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={quote.full_name} status={quote.status} size="md" />
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">
              {quote.full_name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {quote.role && <RoleBadge role={quote.role} />}
              <span className="text-[10px] text-slate-400">ID #{quote.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={quote.status} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100">
        {/* ── Product card ── */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Product Enquired
          </p>
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
            <ProductThumb
              src={quote.image}
              alt={`${quote.brand_name} ${quote.model_name}`}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-800 truncate">
                {quote.brand_name} {quote.model_name}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {quote.product_id && (
                  <span className="text-[10px] font-semibold text-orange-600 bg-white border border-orange-200 px-2 py-0.5 rounded-md">
                    Product ID: {quote.product_id}
                  </span>
                )}
                {quote.brand_id && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {quote.brand_id?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Customer Contact
          </p>
          <div className="space-y-1.5">
            <a
              href={`mailto:${quote.email}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/60 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Email
                </p>
                <p className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-orange-600 transition-colors mt-0.5">
                  {quote.email}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-orange-400 shrink-0" />
            </a>
            <a
              href={`tel:${quote.phone_no}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Phone
                </p>
                <p className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">
                  {quote.phone_no}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-blue-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Enquiry Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: MapPin, label: "Location", value: quote.location },
              { icon: Briefcase, label: "Role", value: fmtRole(quote.role) },
              { icon: Clock, label: "Received", value: quote.created_at },
              {
                icon: FileText,
                label: "Brand ID",
                value: quote.brand_id?.toUpperCase(),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {label}
                  </p>
                  <p className="text-[12px] font-bold text-slate-700 leading-snug truncate">
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Status update ── */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
            Update Status
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(quote.id, opt.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer
                  ${
                    quote.status === opt.value
                      ? `${opt.badge} ring-2 ${opt.ring}`
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 p-4 bg-white border-t border-slate-100 shrink-0">
        <a
          href={`mailto:${quote.email}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/20"
        >
          <Mail className="w-4 h-4" /> Reply via Email
        </a>
        <a
          href={`tel:${quote.phone_no}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" /> Call
        </a>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ current, last, total, onPrev, onNext }) => (
  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0">
    <p className="text-[11px] text-slate-400">
      <span className="font-bold text-slate-600">{total}</span> total · pg{" "}
      <span className="font-bold text-slate-600">{current}</span> / {last}
    </p>
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        disabled={current <= 1}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white
          text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <button
        onClick={onNext}
        disabled={current >= last}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white
          text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProductQuotations = () => {
  const { user, token } = useAuth();
  const brandId = user?.brand_id;
  // console.log("brand Id", brandId)
  const ITEMS_PER_PAGE = 8;

  const [allData, setAllData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState({});
  const [checked, setChecked] = useState(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(
    async (pg = 1, isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const data = await getProductQuotations({
          brand_id: brandId,
          page: pg,
          // token,
        });
        setAllData(data.data || []);
        setLastPage(data.last_page || 1);
        setTotal(data.total_records || 0);
        setPage(pg);
        setSelected(null);
        setChecked(new Set());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [brandId, token],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const enriched = allData.map((q) => ({
    ...q,
    status: statuses[q.id] || "new",
  }));
  const afterFilter = enriched.filter(
    (q) => filterStatus === "all" || q.status === filterStatus,
  );
  const afterSearch = afterFilter.filter(
    (q) =>
      !search ||
      q.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.phone_no?.includes(search) ||
      q.model_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.location?.toLowerCase().includes(search.toLowerCase()),
  );
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === "name")
      return (a.full_name || "").localeCompare(b.full_name || "");
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const counts = {
    new: enriched.filter((q) => q.status === "new").length,
    contacted: enriched.filter((q) => q.status === "contacted").length,
    resolved: enriched.filter((q) => q.status === "resolved").length,
  };

  const handleStatusChange = (id, value) => {
    setStatuses((p) => ({ ...p, [id]: value }));
    setSelected((p) => (p?.id === id ? { ...p, status: value } : p));
  };
  const toggleCheck = (id) =>
    setChecked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setChecked(
      checked.size === paginated.length
        ? new Set()
        : new Set(paginated.map((q) => q.id)),
    );
  const bulkStatus = (status) => {
    const u = {};
    checked.forEach((id) => {
      u[id] = status;
    });
    setStatuses((p) => ({ ...p, ...u }));
    setChecked(new Set());
  };
  const doExport = () =>
    exportCSV(
      checked.size > 0 ? sorted.filter((q) => checked.has(q.id)) : sorted,
    );

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [search, filterStatus, sortBy]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] animate-fade-in">
      {/* Dashboard header */}
      <DashboardHeader
        title="Feature Equipment Quotes"
        description="Quote requests received for your featured product listings."
        total={total}
        counts={counts}
        doExport={doExport}
        onRefresh={() => load(page, true)}
        refreshing={refreshing}
      />

      {/* ── Two-card layout ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* LEFT — list */}
        <div className="flex flex-col w-full lg:w-[46%] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
          {/* Toolbar */}
          <div className="px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2
                focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, product, location, phone…"
                  className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-slate-300 hover:text-slate-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`p-2 rounded-lg border transition-all cursor-pointer
                  ${showFilters ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
                  {["all", "new", "contacted", "resolved"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer
                        ${filterStatus === s ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-auto text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
                >
                  <option value="newest">↓ Newest</option>
                  <option value="oldest">↑ Oldest</option>
                  <option value="name">A→Z Name</option>
                </select>
              </div>
            )}
          </div>

          {/* Bulk bar */}
          {checked.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
              <span className="text-[11px] font-bold text-orange-700">
                {checked.size} selected
              </span>
              <div className="flex items-center gap-1 ml-auto flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => bulkStatus(s.value)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${s.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </button>
                ))}
                <button
                  onClick={() => setChecked(new Set())}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 bg-white text-slate-500 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border-b border-slate-200 shrink-0">
            <button
              onClick={toggleAll}
              className="shrink-0 text-slate-300 hover:text-orange-500 cursor-pointer transition-colors"
            >
              {checked.size === paginated.length && paginated.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-orange-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span className="w-8 shrink-0" />
            <span className="w-9 shrink-0" />
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">
              Customer · Product
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden md:block">
              Role
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block pr-4">
              Status
            </p>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-3">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  {error}
                </p>
                {/* <p className="text-xs text-slate-400 mb-4">Failed to load</p> */}
                <button
                  onClick={() => load(page)}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  No results
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your filters or search
                </p>
              </div>
            ) : (
              paginated.map((q) => (
                <QuoteRow
                  key={q.id}
                  quote={q}
                  onClick={setSelected}
                  isSelected={selected?.id === q.id}
                  isChecked={checked.has(q.id)}
                  onCheck={toggleCheck}
                />
              ))
            )}
          </div>

          <Pagination
            current={page}
            last={totalPages}
            total={sorted.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>

        {/* RIGHT — detail */}
        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DetailPanel
            quote={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <DetailPanel
              quote={selected}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductQuotations;
