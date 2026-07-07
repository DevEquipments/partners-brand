import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Phone,
  Mail,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Inbox,
  X,
  Hash,
  Download,
  CheckSquare,
  Square,
  CheckCircle2,
  SlidersHorizontal,
  Users,
  AlertCircle,
  ArrowRight,
  FileText,
} from "lucide-react";
import { getPremiumBrandInquiries } from "../services/inquiryApi";
import DashboardHeader from "../components/DashboardHeader";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS = [
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
const getStatus = (val) => STATUS.find((s) => s.value === val) || STATUS[0];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const exportCSV = (rows) => {
  const h = [
    "Inquiry ID",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Inquiry Message",
    "Brand",
    "Received",
    "Status",
  ];
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.email,
      r.mobile,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.brand_id,
      r.created_at,
      r.status || "new",
    ].join(","),
  );
  const blob = new Blob([[h.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `inquiries_${Date.now()}.csv`;
  a.click();
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "sm" }) => {
  const sz = size === "md" ? "w-10 h-10 text-[11px]" : "w-8 h-8 text-[10px]";
  return (
    <div
      className={`${sz} rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0`}
    >
      {getInitials(name)}
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
    <div className="w-4 h-4 rounded bg-slate-100 shrink-0" />
    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-slate-200 rounded w-32" />
      <div className="h-2 bg-slate-100 rounded w-48" />
    </div>
    <div className="h-2 bg-slate-100 rounded w-14 hidden sm:block" />
  </div>
);

// ─── Inquiry row — each row is its own visual unit ─────────────────────────────
// Status-colored left border on every row keeps the list easy to scan
const InquiryRow = ({ inquiry, onClick, isSelected, isChecked, onCheck }) => {
  const s = getStatus(inquiry.status);
  return (
    <div
      onClick={() => onClick(inquiry)}
      className={`
        flex items-center gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer
        transition-colors duration-100 select-none
        border-l-[3px] ${s.rowBorder}
        ${isSelected ? "bg-orange-50" : "bg-white hover:bg-slate-50"}
      `}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCheck(inquiry.id);
        }}
        className="shrink-0 text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
      >
        {isChecked ? (
          <CheckSquare className="w-4 h-4 text-orange-500" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>

      <Avatar name={inquiry.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={`text-[13px] font-semibold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}
          >
            {inquiry.name}
          </p>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">
            #{inquiry.id}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate leading-relaxed">
          {inquiry.message}
        </p>
      </div>

      <div className="hidden md:block shrink-0">
        <StatusBadge status={inquiry.status} />
      </div>

      <span className="text-[10px] text-slate-300 shrink-0 whitespace-nowrap hidden lg:block">
        {inquiry.created_at?.split(" ").slice(0, 2).join(" ")}
      </span>

      <ArrowRight
        className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-orange-400" : "text-slate-200"}`}
      />
    </div>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const InquiryDetailPanel = ({ inquiry, onClose, onStatusChange }) => {
  if (!inquiry)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No inquiry selected
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Select an inquiry to view its details.
        </p>
      </div>
    );

  const s = getStatus(inquiry.status);

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r border-b ${s.header} shrink-0`}
      >
        <div className="flex items-center gap-3">
          <Avatar name={inquiry.name} size="md" />
          <div>
            <p className="text-[14px] font-bold text-slate-900 leading-tight">
              {inquiry.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Inquiry #{inquiry.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={inquiry.status} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5">
            Contact
          </p>
          <a
            href={`mailto:${inquiry.email}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Email
              </p>
              <p className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-orange-600 transition-colors">
                {inquiry.email}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-orange-400 shrink-0" />
          </a>

          <a
            href={`tel:${inquiry.mobile}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Mobile
              </p>
              <p className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                {inquiry.mobile}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-blue-400 shrink-0" />
          </a>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5 mb-2">
            Details
          </p>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50">
              <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Received
                </p>
                <p className="text-[12px] font-semibold text-slate-700">
                  {inquiry.created_at}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <Hash className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Brand
                </p>
                <p className="text-[12px] font-semibold text-slate-700">
                  {inquiry.brand_id?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5 mb-2">
            Message
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {inquiry.message || "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0.5 mb-2">
            Update Status
          </p>
          <div className="flex gap-2 flex-wrap">
            {STATUS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(inquiry.id, opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer
                  ${
                    inquiry.status === opt.value
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

      <div className="flex gap-2 p-4 bg-white border-t border-slate-100 shrink-0">
        <a
          href={`mailto:${inquiry.email}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/25"
        >
          <Mail className="w-4 h-4" /> Reply via Email
        </a>
        <a
          href={`tel:${inquiry.mobile}`}
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
const ProductInquiries = () => {
  const { user, token } = useAuth();
  const brandId = user?.brand_id || "jcb";

  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
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
        const data = await getPremiumBrandInquiries({
          brand_id: "jcb",
          page: pg,
        });
        setInquiries(data.data || []);
        setLastPage(data.last_page || 1);
        setTotal(data.total_records || 0);
        setPage(pg);
        setSelectedInquiry(null);
        setChecked(new Set());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, brandId],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const enriched = inquiries.map((inquiry) => ({
    ...inquiry,
    status: statuses[inquiry.id] || "new",
  }));
  const afterFilter =
    filterStatus === "all"
      ? enriched
      : enriched.filter((inquiry) => inquiry.status === filterStatus);
  const afterSearch = afterFilter.filter(
    (inquiry) =>
      !search ||
      inquiry.name.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.mobile.includes(search),
  );
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id;
  });

  const counts = {
    new: enriched.filter((inquiry) => inquiry.status === "new").length,
    contacted: enriched.filter((inquiry) => inquiry.status === "contacted")
      .length,
    resolved: enriched.filter((inquiry) => inquiry.status === "resolved")
      .length,
  };

  const handleStatusChange = (id, status) => {
    setStatuses((p) => ({ ...p, [id]: status }));
    setSelectedInquiry((p) => (p?.id === id ? { ...p, status } : p));
  };
  const toggleCheck = (id) =>
    setChecked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setChecked(
      checked.size === sorted.length
        ? new Set()
        : new Set(sorted.map((inquiry) => inquiry.id)),
    );
  const bulkStatus = (st) => {
    const u = {};
    checked.forEach((id) => {
      u[id] = st;
    });
    setStatuses((p) => ({ ...p, ...u }));
    setChecked(new Set());
  };
  const doExport = () =>
    exportCSV(
      checked.size > 0
        ? sorted.filter((inquiry) => checked.has(inquiry.id))
        : sorted,
    );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] animate-fade-in">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Customer Inquiries"
        description="Manage enquiries from your product listings"
        total={total}
        counts={counts}
        doExport={doExport}
        onRefresh={() => load(page, true)}
        refreshing={refreshing}
      />

      {/* ── Two SEPARATE cards side by side — gap shows page bg (#eceef3) ── */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* LEFT CARD — list panel, bg-slate-50 so white rows pop within */}
        <div className="flex flex-col w-full lg:w-[44%] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
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
                  placeholder="Search customer, email or phone..."
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
                  className="text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
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
                {STATUS.map((s) => (
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

          {/* Column header */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border-b border-slate-200 shrink-0">
            <button
              onClick={toggleAll}
              className="shrink-0 text-slate-300 hover:text-orange-500 cursor-pointer transition-colors"
            >
              {checked.size === sorted.length && sorted.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-orange-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span className="w-8 shrink-0" />
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">
              Enquirer
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden md:block">
              Status
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block pr-5">
              Date
            </p>
          </div>

          {/* Rows — each white row on slate-50 bg = clearly visible */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-3">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Unable to load inquiries
                </p>
                <p className="text-xs text-slate-400 mb-4">{error}</p>
                <button
                  onClick={() => load(page)}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  No inquiries found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              sorted.map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  onClick={setSelectedInquiry}
                  isSelected={selectedInquiry?.id === inquiry.id}
                  isChecked={checked.has(inquiry.id)}
                  onCheck={toggleCheck}
                />
              ))
            )}
          </div>

          {!loading && !error && inquiries.length > 0 && (
            <Pagination
              current={page}
              last={lastPage}
              total={total}
              onPrev={() => load(page - 1)}
              onNext={() => load(page + 1)}
            />
          )}
        </div>

        {/* RIGHT CARD — detail panel, pure white, separate card */}
        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <InquiryDetailPanel
            inquiry={selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selectedInquiry && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <InquiryDetailPanel
              inquiry={selectedInquiry}
              onClose={() => setSelectedInquiry(null)}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInquiries;
