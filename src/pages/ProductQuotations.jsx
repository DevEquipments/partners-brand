import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Phone,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
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
  MapPin,
  Briefcase,
  Wrench,
  RefreshCw,
  Save,
  Calendar,
  Flag,
  MessageSquare,
  Edit3,
  Eye,
  Star,
  Clock,
  ChevronDown,
  Check,
  Copy,
  Building2,
  FileText,
  Circle,
  Flame,
  MessageCircle,
  PhoneCall,
  CalendarClock,
  PlusCircle,
  User,
  Zap,
} from "lucide-react";
import { getProductQuotations } from "../services/productQuotation";
import DashboardHeader from "../components/DashboardHeader";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = [
  {
    value: "new",
    label: "New",
    dot: "bg-blue-500",
    rowBorder: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    ring: "ring-blue-300",
    panel: "bg-gradient-to-r from-blue-50 to-indigo-50/40 border-blue-200",
  },
  {
    value: "contacted",
    label: "Contacted",
    dot: "bg-amber-500",
    rowBorder: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "ring-amber-300",
    panel: "bg-gradient-to-r from-amber-50 to-yellow-50/40 border-amber-200",
  },
  {
    value: "resolved",
    label: "Resolved",
    dot: "bg-emerald-500",
    rowBorder: "border-l-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-300",
    panel: "bg-gradient-to-r from-emerald-50 to-green-50/40 border-emerald-200",
  },
];

const PRIORITIES = [
  {
    value: "high",
    label: "High",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: Flame,
  },
  {
    value: "medium",
    label: "Medium",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertCircle,
  },
  {
    value: "low",
    label: "Low",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: Circle,
  },
];

const ROLE_MAP = {
  contractor: "Contractor",
  "builder/developer": "Builder/Dev",
  infrastructure_company: "Infrastructure",
  mining_company: "Mining",
  rental_company: "Rental Co.",
  "government/psu": "Govt/PSU",
  "individual/other": "Individual",
};

const getStatus = (v) => STATUSES.find((s) => s.value === v) || STATUSES[0];
const getPriority = (v) =>
  PRIORITIES.find((p) => p.value === v) || PRIORITIES[1];
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
    "Location",
    "Role",
    "Priority",
    "Status",
    "Notes",
    "Follow-up",
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
      r.location,
      r.role,
      r.priority || "medium",
      r.status || "new",
      (r.notes || "").replace(/,/g, ""),
      r.follow_up || "",
      r.created_at,
    ].join(","),
  );
  const blob = new Blob([[h.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `quotes_${Date.now()}.csv`;
  a.click();
};

// ─── Product image ────────────────────────────────────────────────────────────
const ProductImg = ({ src, alt, className }) => {
  const [err, setErr] = useState(false);
  if (!src || err)
    return (
      <div
        className={`${className} bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center`}
      >
        <Wrench className="w-5 h-5 text-slate-300" />
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      className={`${className} object-cover`}
    />
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, status, size = "sm" }) => {
  const s = getStatus(status);
  const sz =
    size === "lg"
      ? "w-12 h-12 text-sm"
      : size === "md"
        ? "w-9 h-9 text-[11px]"
        : "w-7 h-7 text-[10px]";
  return (
    <div
      className={`relative ${sz} rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center font-bold text-white shrink-0`}
    >
      {getInitials(name)}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${s.dot} ring-[2px] ring-white`}
      />
    </div>
  );
};

const StatusBadge = ({ status, sm }) => {
  const s = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-sm ${s.badge} ${sm ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-[10px]"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
    <div className="w-4 h-4 rounded bg-slate-100" />
    <div className="w-7 h-7 rounded-full bg-slate-200" />
    <div className="w-10 h-10 rounded-lg bg-slate-100" />
    <div className="flex-1 space-y-1.5">
      <div className="h-2.5 bg-slate-200 rounded w-28" />
      <div className="h-2 bg-slate-100 rounded w-40" />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-14 hidden md:block" />
  </div>
);

// ─── Quote row ────────────────────────────────────────────────────────────────
const QuoteRow = ({ quote, onClick, isSelected, isChecked, onCheck }) => {
  const s = getStatus(quote.status);
  const p = getPriority(quote.priority);
  return (
    <div
      onClick={() => onClick(quote)}
      className={`group flex items-center gap-3 border-b border-slate-200/80 px-3.5 py-3.5 transition-all duration-200 select-none border-l-[3px] ${s.rowBorder}
        ${isSelected ? "bg-orange-50/80 shadow-[0_12px_24px_-18px_rgba(249,115,22,0.45)] ring-1 ring-orange-100" : "bg-white hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_10px_20px_-16px_rgba(15,23,42,0.28)]"}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCheck(quote.id);
        }}
        className="shrink-0 rounded-md p-1 text-slate-300 transition-all hover:bg-orange-50 hover:text-orange-500 cursor-pointer"
      >
        {isChecked ? (
          <CheckSquare className="w-4 h-4 text-orange-500" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>

      <Avatar name={quote.full_name} status={quote.status} />

      {/* Product thumbnail */}
      <ProductImg
        src={quote.image}
        alt={`${quote.brand_name} ${quote.model_name}`}
        className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 shadow-sm"
      />

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <p
            className={`truncate text-[13px] font-semibold ${isSelected ? "text-orange-700" : "text-slate-800"}`}
          >
            {quote.full_name}
          </p>
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
            #{quote.id}
          </span>
          {quote.priority === "high" && (
            <span className="shrink-0 text-[10px]">🔴</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`truncate text-[11px] font-semibold ${isSelected ? "text-orange-600" : "text-slate-600"}`}
          >
            {quote.brand_name} {quote.model_name}
          </span>
          {quote.location && (
            <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-slate-400">
              <MapPin className="h-2.5 w-2.5" />
              {quote.location}
            </span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 md:block">
        <StatusBadge status={quote.status} sm />
      </div>
      <ArrowRight
        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${isSelected ? "text-orange-400" : "text-slate-300"}`}
      />
    </div>
  );
};

const Timeline = ({ quote }) => {
  const items = [
    {
      title: "Follow-up",
      description: quote.follow_up
        ? `Next follow-up is scheduled for ${quote.follow_up}.`
        : "No follow-up date has been set yet.",
      date: quote.follow_up || "Pending",
      time: "Today",
      user: "Sales team",
      icon: CalendarClock,
    },
    {
      title: "WhatsApp",
      description: quote.phone_no
        ? "A direct WhatsApp outreach is ready for this lead."
        : "WhatsApp outreach is pending.",
      date: quote.phone_no ? "Ready" : "Pending",
      time: "Now",
      user: "Rep",
      icon: MessageCircle,
    },
    {
      title: "Email",
      description: quote.email
        ? "Email contact is available for quick follow-up."
        : "No email is on file for this lead.",
      date: quote.email ? "Ready" : "Pending",
      time: "Now",
      user: "Rep",
      icon: Mail,
    },
    {
      title: "Status Changed",
      description: `The current stage is ${getStatus(quote.status).label.toLowerCase()}.`,
      date: quote.created_at ? quote.created_at.split(" ")[0] : "Recent",
      time: "Updated",
      user: "CRM",
      icon: RefreshCw,
    },
    {
      title: "Notes Added",
      description: quote.notes
        ? quote.notes
        : "No internal notes have been added yet.",
      date: "Note",
      time: "Latest",
      user: "Sales",
      icon: FileText,
    },
    {
      title: "Lead Created",
      description: `${quote.full_name || "Customer"} submitted this enquiry from the featured product flow.`,
      date: quote.created_at ? quote.created_at.split(" ")[0] : "Today",
      time: "Created",
      user: "System",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={`${item.title}-${index}`}
            className="flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-slate-800">
                  {item.title}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.time}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">
                {item.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span className="rounded-full bg-white px-2 py-1 font-medium">
                  {item.date}
                </span>
                <span className="rounded-full bg-white px-2 py-1 font-medium">
                  {item.user}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DetailPanel = ({ quote, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [editData, setEditData] = useState({
    status: "new",
    priority: "medium",
    notes: "",
    follow_up: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(null);
  const notesRef = useRef(null);

  useEffect(() => {
    if (quote) {
      setEditData({
        status: quote.status || "new",
        priority: quote.priority || "medium",
        notes: quote.notes || "",
        follow_up: quote.follow_up || "",
      });
      setActiveTab("overview");
      setSaved(false);
    }
  }, [quote?.id]);

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = `${Math.min(notesRef.current.scrollHeight, 220)}px`;
    }
  }, [editData.notes]);

  if (!quote) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50 px-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.4)]">
          <MessageSquare className="h-9 w-9 text-slate-300" />
        </div>
        <p className="text-[13px] font-semibold text-slate-500">
          Select an enquiry
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Click any row on the left to view and manage it here
        </p>
      </div>
    );
  }

  const s = getStatus(editData.status);
  const p = getPriority(editData.priority);
  const leadSource =
    quote.lead_source ||
    quote.source ||
    quote.lead_source_name ||
    quote.lead_source_value ||
    "";
  const lastUpdated =
    quote.updated_at ||
    quote.last_updated ||
    quote.updated_on ||
    quote.modified_at ||
    "";
  const createdDate = quote.created_at ? quote.created_at.split(" ")[0] : "";

  const formatDateLabel = (value = "") => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onUpdate(quote.id, editData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = async (type) => {
    const value = type === "phone" ? quote.phone_no : quote.email;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  const quickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const handleQuickAction = (action) => {
    if (action === "copy-phone") {
      handleCopy("phone");
      return;
    }
    if (action === "copy-email") {
      handleCopy("email");
      return;
    }
    if (action === "contacted") {
      const next = { ...editData, status: "contacted" };
      setEditData(next);
      onUpdate(quote.id, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
      return;
    }
    if (action === "resolved") {
      const next = { ...editData, status: "resolved" };
      setEditData(next);
      onUpdate(quote.id, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
      return;
    }
    if (action === "follow-up") {
      const next = { ...editData, follow_up: quickDate(1) };
      setEditData(next);
      onUpdate(quote.id, next);
      setActiveTab("update");
      return;
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/80">
      <div
        className={`shrink-0 border-b shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ${s.panel}`}
      >
        <div className="relative h-28 overflow-hidden md:h-32">
          <ProductImg
            src={
              quote?.image ||
              "https://equipmentsdekho.com/category//banner/24/1/DESKTOP/1"
            }
            // src={quote.image}
            alt={`${quote.brand_name} ${quote.model_name}`}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
            <div className="flex absolute right-0 shrink-0 items-center gap-2">
              <button
                onClick={() => handleCopy("phone")}
                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-xl border border-white/20 bg-orange-600/60 text-white transition hover:bg-orange-600/40"
                title="Copy phone"
              >
                {copied === "phone" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleCopy("email")}
                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-xl border border-white/20 bg-orange-600/60 text-white transition hover:bg-orange-600/40"
                title="Copy email"
              >
                {copied === "email" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={`https://wa.me/91${quote.phone_no}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-xl border border-white/20 bg-orange-600/60 text-white transition hover:bg-orange-600/40"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-xl border border-white/20 bg-orange-600/60 text-white transition hover:bg-orange-600/40"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                {quote.full_name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                  <MapPin className="h-3 w-3" />
                  {quote.location || "Location"}
                </span>
                <StatusBadge status={editData.status} />
              </div>
            </div>
            <div className="shrink-0 rounded-md border border-white/20 bg-black/30 px-2.5 py-2 text-right backdrop-blur-sm">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/70">
                Updated
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-white">
                {formatDateLabel(lastUpdated || createdDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 bg-white/85 px-3 py-2.5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar
                name={quote.full_name}
                status={editData.status}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-slate-900">
                  {quote.full_name}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {quote.brand_name} {quote.model_name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${p.bg} ${p.border} ${p.color}`}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/80">
                  <p.icon className="h-3 w-3" />
                </span>
                {p.label}
              </span>
              {leadSource && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
                  <Briefcase className="h-3 w-3" />
                  {leadSource}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                <Clock className="h-3 w-3" />
                {formatDateLabel(createdDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-10 flex gap-1 border-t border-slate-200 bg-white/95 px-2.5 py-2 backdrop-blur">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "update", label: "Update Details", icon: Edit3 },
            { id: "timeline", label: "Timeline", icon: Clock },
            { id: "quick-actions", label: "Quick Actions", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm border-b-2 px-2.5 py-2 text-[10px] font-semibold transition-all cursor-pointer ${activeTab === tab.id ? "border-orange-500 bg-orange-50/80 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5 lg:px-3">
          <div className="space-y-2.5">
            <div className="grid gap-2.5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Customer Information
                    </p>
                    <p className="text-[12px] font-semibold text-slate-800">
                      Lead profile
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center">
                  <Avatar
                    name={quote.full_name}
                    status={editData.status}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-slate-900">
                      {quote.full_name || "—"}
                    </p>
                    <p className="mt-0.5 text-[12px] text-slate-600">
                      {fmtRole(quote.role) || "Lead"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                        <Phone className="h-3 w-3" /> {quote.phone_no || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                        <Mail className="h-3 w-3" /> {quote.email || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                        <MapPin className="h-3 w-3" /> {quote.location || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Product Information
                    </p>
                    <p className="text-[12px] font-semibold text-slate-800">
                      Featured enquiry
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <ProductImg
                    src={quote.image}
                    alt={`${quote.brand_name} ${quote.model_name}`}
                    className="h-16 w-16 rounded-md border border-slate-200 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-800">
                      {quote.brand_name} {quote.model_name}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {quote.product_id || "Product ID unavailable"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                        <Wrench className="h-3 w-3" /> {quote.product_id || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                        <Briefcase className="h-3 w-3" />{" "}
                        {quote.category || quote.product_category || "Featured"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-2.5 xl:grid-cols-[1fr_1.1fr]">
              <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Lead Information
                    </p>
                    <p className="text-[12px] font-semibold text-slate-800">
                      Current context
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-700">
                      {s.label}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Priority
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-700">
                      {p.label}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Created
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-700">
                      {formatDateLabel(createdDate)}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Follow-up
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-slate-700">
                      {quote.follow_up || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Internal Notes
                    </p>
                    <p className="text-[12px] font-semibold text-slate-800">
                      Latest context
                    </p>
                  </div>
                </div>
                <div
                  className={`rounded-md border p-3 ${quote.notes ? "border-amber-200 bg-amber-50" : "border-dashed border-slate-200 bg-slate-50"}`}
                >
                  {quote.notes ? (
                    <p className="text-[12px] leading-6 text-slate-700">
                      {quote.notes}
                    </p>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-400 shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-[12px] font-semibold text-slate-700">
                        No notes yet
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Capture key updates and follow-ups here.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("update")}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Add note
                </button>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.35)]">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Lead Summary
                  </p>
                  <p className="text-[12px] font-semibold text-slate-800">
                    Key indicators
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Days since created
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-700">
                    {createdDate ? "1 day" : "—"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Last updated
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-700">
                    {formatDateLabel(lastUpdated || createdDate)}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Current status
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-700">
                    {s.label}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Assigned priority
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-700">
                    {p.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "update" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* <div className="border-b border-slate-200 bg-white/90 px-2.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-slate-800">
                  Update lead
                </p>
                <p className="text-[11px] text-slate-500">
                  Keep every detail current
                </p>
              </div>
              <div className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
                {saved ? "Saved" : "Live"}
              </div>
            </div>
          </div> */}
          <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5">
            <div className="space-y-2.5 pb-3">
              <div className="rounded-sm border border-slate-200 bg-slate-900 p-3 text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.9)]">
                <div className="grid gap-2 text-[11px] sm:grid-cols-2">
                  <div className="rounded-md border border-white/10 bg-white/10 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      Status
                    </p>
                    <p className="mt-1 font-semibold">
                      {getStatus(editData.status).label}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/10 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      Priority
                    </p>
                    <p className="mt-1 font-semibold">
                      {getPriority(editData.priority).label}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/10 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      Follow-up
                    </p>
                    <p className="mt-1 font-semibold">
                      {editData.follow_up || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/10 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                      Notes
                    </p>
                    <p className="mt-1 font-semibold">
                      {editData.notes.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2.5 xl:grid-cols-2">
                <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Lead Status
                      </p>
                      <p className="text-[12px] font-semibold text-slate-800">
                        Set the current stage
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
                    {STATUSES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setEditData((p) => ({ ...p, status: opt.value }))
                        }
                        className={`flex-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition-all ${editData.status === opt.value ? `${opt.badge} ring-2 ${opt.ring}` : "bg-transparent text-slate-500 hover:bg-white"}`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${opt.dot}`}
                          />
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                      <Flag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Priority
                      </p>
                      <p className="text-[12px] font-semibold text-slate-800">
                        Define urgency
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {PRIORITIES.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setEditData((p) => ({ ...p, priority: opt.value }))
                          }
                          className={`rounded-md border px-1 text-left transition-all ${editData.priority === opt.value ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm ring-2 ring-offset-1` : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                        >
                          <div className="flex items-center justify-start">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-semibold">
                              {opt.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-sm xl:col-span-2">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Follow-up
                      </p>
                      <p className="text-[12px] font-semibold text-slate-800">
                        Choose next action
                      </p>
                    </div>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {[
                      { label: "Today", days: 0 },
                      { label: "Tomorrow", days: 1 },
                      { label: "Next Week", days: 7 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() =>
                          setEditData((p) => ({
                            ...p,
                            follow_up: quickDate(item.days),
                          }))
                        }
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={editData.follow_up}
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          follow_up: e.target.value,
                        }))
                      }
                      className="w-full cursor-pointer rounded-md border border-slate-200 bg-white py-2.25 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-sm xl:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Internal Notes
                        </p>
                        <p className="text-[12px] font-semibold text-slate-800">
                          Capture context
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {editData.notes.length}/500
                    </span>
                  </div>
                  <textarea
                    ref={notesRef}
                    value={editData.notes}
                    onChange={(e) =>
                      setEditData((p) => ({
                        ...p,
                        notes: e.target.value.slice(0, 500),
                      }))
                    }
                    placeholder="Add notes, reminders, pricing details, and next steps…"
                    rows={4}
                    className="min-h-[112px] w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Summary
                    </p>
                    <p className="text-[12px] font-semibold text-slate-800">
                      Review before saving
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 text-[11px] sm:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Current Status
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {getStatus(editData.status).label}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Priority
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {getPriority(editData.priority).label}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Follow-up
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {editData.follow_up || "Not set"}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Changes ready to save
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {editData.notes ? "Notes prepared" : "No notes yet"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${saved ? "bg-emerald-500 text-white shadow-[0_12px_24px_-12px_rgba(16,185,129,0.45)]" : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_12px_24px_-12px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : saved ? (
                    <>
                      <Check className="h-4 w-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5">
          <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-slate-800">
                  Activity timeline
                </p>
                <p className="text-[11px] text-slate-500">
                  Newest updates first
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                Live
              </div>
            </div>
            <Timeline quote={quote} />
          </div>
        </div>
      )}

      {activeTab === "quick-actions" && (
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            {/* <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                  <Zap className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Quick Actions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Instantly contact the customer or manage this enquiry.
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                8 Actions
              </span>
            </div> */}

            {/* Primary */}
            <div className="px-6 pt-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Primary Actions
              </h4>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* EMAIL */}

                <a
                  href={`mailto:${quote.email}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                  </div>

                  <h4 className="mt-5 text-sm font-semibold text-slate-900">
                    Email Customer
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Send quotation or follow-up email.
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
                    Available
                  </span>
                </a>

                {/* CALL */}

                <a
                  href={`tel:${quote.phone_no}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
                  </div>

                  <h4 className="mt-5 text-sm font-semibold">Call Customer</h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Talk with customer instantly.
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    Preferred
                  </span>
                </a>

                {/* WHATSAPP */}

                <a
                  href={`https://wa.me/91${quote.phone_no}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                      <MessageCircle className="h-5 w-5 text-emerald-600" />
                    </div>

                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
                  </div>

                  <h4 className="mt-5 text-sm font-semibold">WhatsApp</h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Start WhatsApp conversation.
                  </p>

                  <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    Fastest
                  </span>
                </a>
              </div>
            </div>

            {/* Management */}
            <div className="border-t border-slate-100 px-6 py-6">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Management
              </h4>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* COPY PHONE */}

                <button
                  onClick={() => handleQuickAction("copy-phone")}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Copy Phone
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction("copy-email")}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Copy Email
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction("contacted")}
                  className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Mark Contacted
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction("resolved")}
                  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition hover:bg-emerald-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    Mark Resolved
                  </span>
                </button>

                <button
                  onClick={() => handleQuickAction("follow-up")}
                  className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 transition hover:bg-violet-100"
                >
                  <CalendarClock className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-800">
                    Schedule Follow-up
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ current, last, total, onPrev, onNext }) => (
  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0">
    <p className="text-[11px] text-slate-400">
      <span className="font-bold text-slate-600">{total}</span> total · pg{" "}
      <span className="font-bold text-slate-600">{current}</span>/{last}
    </p>
    <div className="flex gap-1">
      <button
        onClick={onPrev}
        disabled={current <= 1}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <button
        onClick={onNext}
        disabled={current >= last}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
  const PER_PAGE = 8;

  const [allData, setAllData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [localData, setLocalData] = useState({}); // { [id]: { status, priority, notes, follow_up } }
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
          token,
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

  // Merge API data with local edits
  const enriched = allData.map((q) => ({
    ...q,
    ...(localData[q.id] || {}),
    status: localData[q.id]?.status || "new",
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
    if (sortBy === "priority") {
      const o = { high: 0, medium: 1, low: 2 };
      return (o[a.priority] || 1) - (o[b.priority] || 1);
    }
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    new: enriched.filter((q) => q.status === "new").length,
    contacted: enriched.filter((q) => q.status === "contacted").length,
    resolved: enriched.filter((q) => q.status === "resolved").length,
  };

  const handleUpdate = (id, changes) => {
    setLocalData((p) => ({ ...p, [id]: { ...(p[id] || {}), ...changes } }));
    setSelected((p) => (p?.id === id ? { ...p, ...changes } : p));
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
      u[id] = { ...(localData[id] || {}), status };
    });
    setLocalData((p) => ({ ...p, ...u }));
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
      {/* ── Banner ── */}
      <div
        className="relative rounded-md overflow-hidden shrink-0"
        style={{
          background:
            "linear-gradient(135deg,#18181b 0%,#1c1917 40%,#431407 100%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div
          className="absolute pointer-events-none"
          style={{
            left: -60,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle,white 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative flex flex-wrap items-center gap-4 px-6 py-5">
          <div className="shrink-0">
            {/* <div className="inline-flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/25 rounded-full px-2.5 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest">
                Live
              </span>
            </div> */}
            <h1 className="text-[17px] font-bold text-white leading-tight mb-0.5">
              Feature Equipment Quotes
            </h1>
            <p className="text-[11px] text-slate-400">
              Quote requests from your featured product listings
            </p>
          </div>
          <div className="w-px h-9 bg-white/8 shrink-0 hidden sm:block" />
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {[
              {
                icon: Users,
                label: "Total",
                value: total,
                color: "text-white",
                bg: "bg-white/5    border-white/9",
              },
              {
                icon: AlertCircle,
                label: "New",
                value: counts.new,
                color: "text-blue-200",
                bg: "bg-blue-500/10  border-blue-500/20",
              },
              {
                icon: Phone,
                label: "Contacted",
                value: counts.contacted,
                color: "text-amber-200",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: CheckCircle2,
                label: "Resolved",
                value: counts.resolved,
                color: "text-emerald-200",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-[7px] rounded-[10px] border ${bg}`}
              >
                <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                <span className={`text-[15px] font-bold ${color} leading-none`}>
                  {value}
                </span>
                <span className="text-[10px] font-medium text-white/40">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={doExport}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[9px] bg-white/8 border border-white/12 text-slate-200 text-xs font-semibold hover:bg-white/14 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={() => load(page, true)}
              className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[9px] text-white text-xs font-bold cursor-pointer hover:opacity-90 border border-orange-500/30 transition-all"
              style={{
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Two cards ── */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* LEFT — list */}
        <div className="flex w-full shrink-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-slate-50 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] lg:w-[42%]">
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
                  placeholder="Name, product, location…"
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
                className={`p-2 rounded-lg border transition-all cursor-pointer ${showFilters ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}
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
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize cursor-pointer transition-all
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
                  <option value="priority">↑ Priority</option>
                  <option value="name">A→Z</option>
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
              <div className="flex items-center gap-1 ml-auto">
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

          {/* Col headers */}
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
            <span className="w-7 shrink-0" />
            <span className="w-10 shrink-0" />
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">
              Customer · Product
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden md:block pr-3">
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
                  Failed to load
                </p>
                <p className="text-xs text-slate-400 mb-4">{error}</p>
                <button
                  onClick={() => load(page)}
                  className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-md bg-slate-200 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  No results
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust filters or search
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
        <div className="hidden flex-1 flex-col overflow-hidden rounded-md border border-slate-200 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] lg:flex">
          <DetailPanel
            quote={selected}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
            <DetailPanel
              quote={selected}
              onClose={() => setSelected(null)}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductQuotations;
