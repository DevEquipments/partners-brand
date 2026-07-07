import { useState, useEffect } from "react";
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
} from "lucide-react";
import DashboardHeader from "../components/DashboardHeader";

const MOCK_QUOTES = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@constructionco.in",
    mobile: "9876543210",
    message:
      "Interested in pricing for your heavy-duty loader fleet for our upcoming project.",
    brand_id: "jcb",
    created_at: "20-06-2026 10:30 AM",
    status: "new",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@infraworks.com",
    mobile: "9712345678",
    message:
      "Please share your best quotation for the excavator package with delivery timeline.",
    brand_id: "jcb",
    created_at: "20-06-2026 09:15 AM",
    status: "contacted",
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit.patel@buildfast.in",
    mobile: "9823456789",
    message:
      "We need a competitive quotation for the compact crane unit before next week.",
    brand_id: "jcb",
    created_at: "19-06-2026 04:00 PM",
    status: "new",
  },
  {
    id: 4,
    name: "Suresh Nair",
    email: "suresh.nair@keralaconstructs.in",
    mobile: "9988776655",
    message:
      "Looking for a quotation and availability for your latest boom lift model.",
    brand_id: "jcb",
    created_at: "19-06-2026 11:30 AM",
    status: "contacted",
  },
  {
    id: 5,
    name: "Deepak Singh",
    email: "deepak.singh@roadsinfra.com",
    mobile: "9654321098",
    message:
      "Please send the quotation for the road equipment package with service support.",
    brand_id: "jcb",
    created_at: "18-06-2026 02:45 PM",
    status: "new",
  },
  {
    id: 6,
    name: "Meena Reddy",
    email: "meena.reddy@vizagbuilds.com",
    mobile: "9567234890",
    message:
      "We would like a quotation for your piling machine with site delivery options.",
    brand_id: "jcb",
    created_at: "17-06-2026 09:00 AM",
    status: "resolved",
  },
  {
    id: 7,
    name: "Arjun Mehta",
    email: "arjun.mehta@skybuilders.in",
    mobile: "9445566778",
    message:
      "Could you share the quotation for the tower crane and installation package?",
    brand_id: "jcb",
    created_at: "17-06-2026 06:30 PM",
    status: "new",
  },
  {
    id: 8,
    name: "Kavya Rao",
    email: "kavya.rao@bengaluruworks.com",
    mobile: "9334455667",
    message:
      "Need a quotation for three scissor lifts for an upcoming fit-out project.",
    brand_id: "jcb",
    created_at: "16-06-2026 03:20 PM",
    status: "resolved",
  },
  {
    id: 9,
    name: "Vikram Joshi",
    email: "vikram.joshi@rajasthaninfra.in",
    mobile: "9221133445",
    message:
      "Please send quotation details for the concrete mixer fleet and maintenance plan.",
    brand_id: "jcb",
    created_at: "16-06-2026 10:45 AM",
    status: "contacted",
  },
  {
    id: 10,
    name: "Neha Agarwal",
    email: "neha.agarwal@delhidevs.com",
    mobile: "9112244336",
    message:
      "Need the quotation for the compactor package with rental terms and delivery.",
    brand_id: "jcb",
    created_at: "15-06-2026 08:00 AM",
    status: "new",
  },
  {
    id: 11,
    name: "Rohit Gupta",
    email: "rohit.gupta@mpconstructions.com",
    mobile: "9876112233",
    message:
      "Please provide a quotation for the dumper truck requirement for mining operations.",
    brand_id: "jcb",
    created_at: "15-06-2026 12:30 PM",
    status: "new",
  },
  {
    id: 12,
    name: "Lakshmi Venkat",
    email: "lakshmi.v@chennaicorp.in",
    mobile: "9543211234",
    message:
      "Would like a quotation for crane truck rental with operator support.",
    brand_id: "jcb",
    created_at: "14-06-2026 05:00 PM",
    status: "resolved",
  },
];

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

const getStatus = (val) => STATUSES.find((s) => s.value === val) || STATUSES[0];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const exportCSV = (rows) => {
  const h = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Message",
    "Brand",
    "Status",
    "Received Date",
  ];
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.email,
      r.mobile,
      `"${(r.message || "").replace(/"/g, '""')}"`,
      r.brand_id,
      r.status || "new",
      r.created_at,
    ].join(","),
  );
  const blob = new Blob([[h.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `quotations_${Date.now()}.csv`;
  a.click();
};

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

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
    <div className="w-4 h-4 rounded bg-slate-100 shrink-0" />
    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-slate-200 rounded w-28" />
      <div className="h-2 bg-slate-100 rounded w-44" />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-14 hidden md:block" />
    <div className="h-4 bg-slate-100 rounded-full w-12 hidden lg:block" />
  </div>
);

const QuoteRow = ({ quote, onClick, isSelected, isChecked, onCheck }) => {
  const s = getStatus(quote.status);
  return (
    <div
      onClick={() => onClick(quote)}
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 cursor-pointer transition-colors duration-100 select-none border-l-[3px] ${s.rowBorder} ${isSelected ? "bg-orange-50" : "bg-white hover:bg-slate-50"}`}
    >
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

      <Avatar name={quote.name} status={quote.status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p
            className={`text-[13px] font-semibold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}
          >
            {quote.name}
          </p>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">
            #{quote.id}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate leading-relaxed">
          {quote.message}
        </p>
      </div>

      <div className="hidden lg:block shrink-0">
        <StatusBadge status={quote.status} />
      </div>

      <span className="text-[10px] text-slate-300 shrink-0 whitespace-nowrap hidden xl:block">
        {quote.created_at?.split(" ").slice(0, 1).join(" ")}
      </span>

      <ArrowRight
        className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-orange-400" : "text-slate-200"}`}
      />
    </div>
  );
};

const DetailPanel = ({ quote, onClose, onStatusChange }) => {
  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400">
          No quotation selected
        </p>
        <p className="text-xs text-slate-300 mt-1">
          Select a quotation to view its details.
        </p>
      </div>
    );
  }

  const s = getStatus(quote.status);

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between px-5 py-4 bg-linear-to-r border-b ${s.header} shrink-0`}
      >
        <div className="flex items-center gap-3">
          <Avatar name={quote.name} status={quote.status} size="md" />
          <div>
            <p className="text-[14px] font-bold text-slate-900 leading-tight">
              {quote.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Quote #{quote.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={quote.status} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Customer Information
          </p>
          <div className="space-y-1.5">
            <a
              href={`mailto:${quote.email}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/60 transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
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
              href={`tel:${quote.mobile}`}
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
                  {quote.mobile}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-blue-400 shrink-0" />
            </a>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Quotation Details
          </p>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50">
              <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Received
                </p>
                <p className="text-[12px] font-semibold text-slate-700">
                  {quote.created_at}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Brand
                </p>
                <p className="text-[12px] font-semibold text-slate-700">
                  {quote.brand_id?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Customer Message
          </p>
          <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {quote.message || "—"}
            </p>
          </div>
        </div>

        <div className="px-5 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Status Update
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(quote.id, opt.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${quote.status === opt.value ? `${opt.badge} ring-2 ${opt.ring}` : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}
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
          href={`mailto:${quote.email}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/20"
        >
          <Mail className="w-4 h-4" /> Reply via Email
        </a>
        <a
          href={`tel:${quote.mobile}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <Phone className="w-4 h-4" /> Call
        </a>
      </div>
    </div>
  );
};

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
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <button
        onClick={onNext}
        disabled={current >= last}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const ProductQuotations = () => {
  const ITEMS_PER_PAGE = 8;

  const [allData] = useState(MOCK_QUOTES);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState({});
  const [checked, setChecked] = useState(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const enriched = allData.map((quote) => ({
    ...quote,
    status: statuses[quote.id] || quote.status,
  }));
  const afterFilter = enriched.filter(
    (quote) => filterStatus === "all" || quote.status === filterStatus,
  );
  const afterSearch = afterFilter.filter(
    (quote) =>
      !search ||
      quote.name.toLowerCase().includes(search.toLowerCase()) ||
      quote.email.toLowerCase().includes(search.toLowerCase()) ||
      quote.mobile.includes(search),
  );
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const counts = {
    new: enriched.filter((quote) => quote.status === "new").length,
    contacted: enriched.filter((quote) => quote.status === "contacted").length,
    resolved: enriched.filter((quote) => quote.status === "resolved").length,
  };

  const handleStatusChange = (id, value) => {
    setStatuses((prev) => ({ ...prev, [id]: value }));
    setSelected((prev) =>
      prev?.id === id ? { ...prev, status: value } : prev,
    );
  };
  const toggleCheck = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setChecked(
      checked.size === paginated.length
        ? new Set()
        : new Set(paginated.map((quote) => quote.id)),
    );
  const bulkStatus = (status) => {
    const updates = {};
    checked.forEach((id) => {
      updates[id] = status;
    });
    setStatuses((prev) => ({ ...prev, ...updates }));
    setChecked(new Set());
  };
  const doExport = () =>
    exportCSV(
      checked.size > 0
        ? sorted.filter((quote) => checked.has(quote.id))
        : sorted,
    );

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [search, filterStatus, sortBy]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] animate-fade-in">
      {/* Dashboard Header */}
      <DashboardHeader
        title="Product Quotations"
        description="Manage quotation requests received for your products."
        total={allData.length}
        counts={counts}
        doExport={doExport}
      />
      {/* <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-zinc-900 via-slate-800 to-slate-900 px-6 py-5 shrink-0">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-500 via-amber-400 to-orange-500" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Product Quotations</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage quotation requests received for your products.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-bold text-white">{allData.length}</span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm font-bold text-blue-300">{counts.new}</span>
              <span className="text-[10px] text-slate-400">New</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">{counts.contacted}</span>
              <span className="text-[10px] text-slate-400">Contacted</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">{counts.resolved}</span>
              <span className="text-[10px] text-slate-400">Resolved</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={doExport} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div> */}

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex flex-col w-full lg:w-[46%] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
          <div className="px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
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
                onClick={() => setShowFilters((value) => !value)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${showFilters ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
                  {["all", "new", "contacted", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer ${filterStatus === status ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {status}
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

          {checked.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
              <span className="text-[11px] font-bold text-orange-700">
                {checked.size} selected
              </span>
              <div className="flex items-center gap-1 ml-auto flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => bulkStatus(status.value)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${status.badge}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                    />{" "}
                    {status.label}
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
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">
              Customer
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block pr-4">
              Status
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  No quotations found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              paginated.map((quote) => (
                <QuoteRow
                  key={quote.id}
                  quote={quote}
                  onClick={setSelected}
                  isSelected={selected?.id === quote.id}
                  isChecked={checked.has(quote.id)}
                  onCheck={toggleCheck}
                />
              ))
            )}
          </div>

          <Pagination
            current={page}
            last={totalPages}
            total={sorted.length}
            onPrev={() => setPage((value) => Math.max(1, value - 1))}
            onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
          />
        </div>

        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DetailPanel
            quote={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

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
