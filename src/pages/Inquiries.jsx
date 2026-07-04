import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Phone, Mail, Clock, Search, ChevronLeft, ChevronRight,
  RefreshCw, MessageSquare, Inbox, X, Download,
  CheckSquare, Square, CheckCircle2, SlidersHorizontal,
  Users, AlertCircle, ArrowRight, MapPin, Wrench,
  Calendar, Flag, Globe, Tag, FileText, Save,
  AlertTriangle, Zap, BookOpen, MessageCircle,
} from "lucide-react";

// ─── Mock data — replace with real API call ───────────────────────────────────
const MOCK_INQUIRIES = [
  { id: 1,  name: "Rajesh Kumar",       email: "rajesh.kumar@constructionco.in", mobile: "9876543210", equipment: "Tower Crane",      category: "Heavy Machinery",  location: "Delhi NCR",    duration: "3 months",  message: "Need a tower crane for a 20-floor residential project. Please share pricing and availability for Q3 2026.", source: "Website",  priority: "high",   status: "open",        created_at: "20-06-2026 10:30 AM", follow_up: "2026-06-25" },
  { id: 2,  name: "Priya Sharma",       email: "priya.sharma@infraworks.com",    mobile: "9712345678", equipment: "Excavator",         category: "Earthmoving",      location: "Mumbai",       duration: "6 weeks",   message: "Looking for a 20T excavator for road widening project on SH-4. Urgently needed.", source: "Referral", priority: "high",   status: "in_progress", created_at: "20-06-2026 09:15 AM", follow_up: "2026-06-22" },
  { id: 3,  name: "Amit Patel",         email: "amit.patel@buildfast.in",        mobile: "9823456789", equipment: "Concrete Pump",     category: "Concrete",         location: "Ahmedabad",    duration: "2 months",  message: "We need a stationary concrete pump for our upcoming mall construction. Capacity 60m³/hr preferred.", source: "App",      priority: "medium", status: "open",        created_at: "19-06-2026 04:00 PM", follow_up: "" },
  { id: 4,  name: "Suresh Nair",        email: "suresh.nair@keralaconstructs.in",mobile: "9988776655", equipment: "Boom Lift",         category: "Access Equipment", location: "Kochi",        duration: "1 month",   message: "Require a 30m boom lift for façade work on a hotel project. Need operator with it.", source: "Website",  priority: "medium", status: "in_progress", created_at: "19-06-2026 11:30 AM", follow_up: "2026-06-24" },
  { id: 5,  name: "Deepak Singh",       email: "deepak.singh@roadsinfra.com",    mobile: "9654321098", equipment: "Motor Grader",      category: "Road Equipment",   location: "Lucknow",      duration: "4 months",  message: "Inquiry for motor grader for NH stretch construction. Government project, GST invoice required.", source: "Direct",   priority: "high",   status: "open",        created_at: "18-06-2026 02:45 PM", follow_up: "" },
  { id: 6,  name: "Meena Reddy",        email: "meena.reddy@vizagbuilds.com",    mobile: "9567234890", equipment: "Piling Machine",    category: "Foundation",       location: "Visakhapatnam",duration: "8 weeks",   message: "Need a hydraulic piling machine for a port expansion project. Please share technical specs.", source: "Referral", priority: "medium", status: "closed",      created_at: "17-06-2026 09:00 AM", follow_up: "" },
  { id: 7,  name: "Arjun Mehta",        email: "arjun.mehta@skybuilders.in",     mobile: "9445566778", equipment: "Tower Crane",       category: "Heavy Machinery",  location: "Pune",         duration: "5 months",  message: "Looking for a Luffing jib tower crane with a 12T capacity for a high-rise project in Baner.", source: "Website",  priority: "low",    status: "open",        created_at: "17-06-2026 06:30 PM", follow_up: "" },
  { id: 8,  name: "Kavya Rao",          email: "kavya.rao@bengaluruworks.com",   mobile: "9334455667", equipment: "Scissor Lift",      category: "Access Equipment", location: "Bengaluru",    duration: "3 weeks",   message: "Need 5 scissor lifts for interior fit-out work in a tech park. Height requirement: 12m.", source: "App",      priority: "low",    status: "spam",        created_at: "16-06-2026 03:20 PM", follow_up: "" },
  { id: 9,  name: "Vikram Joshi",       email: "vikram.joshi@rajasthaninfra.in", mobile: "9221133445", equipment: "Concrete Mixer",    category: "Concrete",         location: "Jaipur",       duration: "2 months",  message: "Require transit mixers (6m³) for a housing society project. Need 3 units simultaneously.", source: "Website",  priority: "medium", status: "in_progress", created_at: "16-06-2026 10:45 AM", follow_up: "2026-06-21" },
  { id: 10, name: "Neha Agarwal",       email: "neha.agarwal@delhidevs.com",     mobile: "9112244336", equipment: "Compactor",         category: "Road Equipment",   location: "Noida",        duration: "6 weeks",   message: "Need a double drum compactor for road base compaction. Project starting July 2026.", source: "Direct",   priority: "low",    status: "open",        created_at: "15-06-2026 08:00 AM", follow_up: "" },
  { id: 11, name: "Rohit Gupta",        email: "rohit.gupta@mpconstructions.com",mobile: "9876112233", equipment: "Dumper Truck",      category: "Transport",        location: "Bhopal",       duration: "3 months",  message: "10 dumper trucks needed for earth moving in a mining area. All valid registrations required.", source: "Referral", priority: "high",   status: "open",        created_at: "15-06-2026 12:30 PM", follow_up: "2026-06-20" },
  { id: 12, name: "Lakshmi Venkat",     email: "lakshmi.v@chennaicorp.in",       mobile: "9543211234", equipment: "Crane Truck",       category: "Heavy Machinery",  location: "Chennai",      duration: "2 weeks",   message: "Need a 50T crane truck for equipment installation at a power plant. One-time job.", source: "Website",  priority: "medium", status: "closed",      created_at: "14-06-2026 05:00 PM", follow_up: "" },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "open",        label: "Open",        dot: "bg-blue-500",    rowBorder: "border-l-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",       header: "from-blue-50 to-blue-100/60 border-blue-200",       ring: "ring-blue-200"    },
  { value: "in_progress", label: "In Progress", dot: "bg-amber-500",   rowBorder: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",     header: "from-amber-50 to-amber-100/60 border-amber-200",    ring: "ring-amber-200"   },
  { value: "closed",      label: "Closed",      dot: "bg-emerald-500", rowBorder: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200",header: "from-emerald-50 to-emerald-100/60 border-emerald-200",ring: "ring-emerald-200" },
  { value: "spam",        label: "Spam",        dot: "bg-red-400",     rowBorder: "border-l-red-300",     badge: "bg-red-50 text-red-600 border-red-200",            header: "from-red-50 to-red-100/60 border-red-200",          ring: "ring-red-200"     },
];

const PRIORITIES = [
  { value: "high",   label: "High",   icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50",    border: "border-red-200"   },
  { value: "medium", label: "Medium", icon: Zap,           color: "text-amber-600", bg: "bg-amber-50",  border: "border-amber-200" },
  { value: "low",    label: "Low",    icon: BookOpen,      color: "text-blue-500",  bg: "bg-blue-50",   border: "border-blue-200"  },
];

const SOURCES = {
  Website:  { icon: Globe,         color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
  Referral: { icon: Users,         color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200" },
  App:      { icon: Zap,           color: "text-blue-500",   bg: "bg-blue-50 border-blue-200" },
  Direct:   { icon: MessageCircle, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
};

const getStatus   = (val) => STATUSES.find(s => s.value === val)   || STATUSES[0];
const getPriority = (val) => PRIORITIES.find(p => p.value === val) || PRIORITIES[1];
const getSource   = (val) => SOURCES[val] || SOURCES.Website;

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const exportCSV = (rows) => {
  const h = ["ID","Name","Email","Mobile","Equipment","Category","Location","Duration","Source","Priority","Status","Received"];
  const lines = rows.map(r => [
    r.id, r.name, r.email, r.mobile, r.equipment, r.category,
    r.location, r.duration, r.source, r.priority, r.status, r.created_at,
  ].join(","));
  const blob = new Blob([[h.join(","), ...lines].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `inquiries_${Date.now()}.csv`; a.click();
};

// ─── Reusable atoms ───────────────────────────────────────────────────────────
const Avatar = ({ name, status, size = "sm" }) => {
  const s = getStatus(status);
  const sz = size === "md" ? "w-10 h-10 text-[11px]" : "w-8 h-8 text-[10px]";
  return (
    <div className={`relative ${sz} rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0`}>
      {getInitials(name)}
      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${s.dot} ring-2 ring-white`} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const p = getPriority(priority);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.bg} ${p.border} ${p.color}`}>
      <p.icon className="w-2.5 h-2.5" />
      {p.label}
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

// ─── Inquiry row ──────────────────────────────────────────────────────────────
const InquiryRow = ({ item, onClick, isSelected, isChecked, onCheck }) => {
  const s  = getStatus(item.status);
  const p  = getPriority(item.priority);
  return (
    <div
      onClick={() => onClick(item)}
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 cursor-pointer
        transition-colors duration-100 select-none border-l-[3px] ${s.rowBorder}
        ${isSelected ? "bg-orange-50" : "bg-white hover:bg-slate-50"}`}
    >
      <button onClick={e => { e.stopPropagation(); onCheck(item.id); }}
        className="shrink-0 text-slate-300 hover:text-orange-500 transition-colors cursor-pointer">
        {isChecked ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
      </button>

      <Avatar name={item.name} status={item.status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className={`text-[13px] font-semibold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}>
            {item.name}
          </p>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">#{item.id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
            {item.equipment}
          </span>
          <span className="text-[11px] text-slate-400 truncate">{item.location}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="hidden lg:block shrink-0">
        <StatusBadge status={item.status} />
      </div>

      <span className="text-[10px] text-slate-300 shrink-0 whitespace-nowrap hidden xl:block">
        {item.created_at?.split(" ").slice(0, 1).join(" ")}
      </span>

      <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-orange-400" : "text-slate-200"}`} />
    </div>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ item, onClose, onStatusChange, onPriorityChange, onNotesSave, notes, setNotes }) => {
  if (!item) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <MessageSquare className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-400">No inquiry selected</p>
      <p className="text-xs text-slate-300 mt-1">Click a row on the left to view details</p>
    </div>
  );

  const s   = getStatus(item.status);
  const p   = getPriority(item.priority);
  const src = getSource(item.source);
  const SrcIcon = src.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Status-tinted header */}
      <div className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r border-b ${s.header} shrink-0`}>
        <div className="flex items-center gap-3">
          <Avatar name={item.name} status={item.status} size="md" />
          <div>
            <p className="text-[14px] font-bold text-slate-900 leading-tight">{item.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${src.bg} ${src.color}`}>
                <SrcIcon className="w-2.5 h-2.5" />
                {item.source}
              </span>
              <span className="text-[10px] text-slate-400">Inquiry #{item.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* ── Contact ── */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
          <div className="space-y-1.5">
            <a href={`mailto:${item.email}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/60 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Email</p>
                <p className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-orange-600 transition-colors mt-0.5">{item.email}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-orange-400 shrink-0" />
            </a>
            <a href={`tel:${item.mobile}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Mobile</p>
                <p className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors mt-0.5">{item.mobile}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-blue-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* ── Equipment interest ── */}
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Equipment Required</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Equipment</p>
                <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.equipment}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Category</p>
                <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Location</p>
                <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Duration</p>
                <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Message</p>
          <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
            <p className="text-[13px] text-slate-600 leading-relaxed">{item.message}</p>
          </div>
        </div>

        {/* ── Status + Priority + Follow-up ── */}
        <div className="px-5 py-3 border-b border-slate-100 space-y-3">
          {/* Status */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map(opt => (
                <button key={opt.value} onClick={() => onStatusChange(item.id, opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer
                    ${item.status === opt.value
                      ? `${opt.badge} ring-2 ${opt.ring}`
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</p>
            <div className="flex gap-1.5">
              {PRIORITIES.map(opt => (
                <button key={opt.value} onClick={() => onPriorityChange(item.id, opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex-1 justify-center
                    ${item.priority === opt.value
                      ? `${opt.bg} ${opt.border} ${opt.color} ring-2 ring-offset-1`
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}
                >
                  <opt.icon className="w-3 h-3" />{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up date */}
          {item.follow_up && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Follow-up Date</p>
                <p className="text-[12px] font-semibold text-orange-700">{item.follow_up}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Internal Notes ── */}
        <div className="px-5 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Notes
            <span className="ml-1.5 text-slate-300 font-normal normal-case tracking-normal">(not visible to customer)</span>
          </p>
          <textarea
            value={notes[item.id] || ""}
            onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
            placeholder="Add notes, follow-up reminders, or internal comments here…"
            rows={3}
            className="w-full text-[12px] text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none resize-none
              focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <button onClick={() => onNotesSave(item.id)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold transition-colors cursor-pointer">
            <Save className="w-3 h-3" /> Save Notes
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 p-4 bg-white border-t border-slate-100 shrink-0">
        <a href={`mailto:${item.email}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/20">
          <Mail className="w-4 h-4" /> Reply via Email
        </a>
        <a href={`tel:${item.mobile}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer">
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
      <button onClick={onPrev} disabled={current <= 1}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white
          text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      <button onClick={onNext} disabled={current >= last}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white
          text-slate-500 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const Inquiries = () => {
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 8;

  const [allData]    = useState(MOCK_INQUIRIES);
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");
  const [statuses, setStatuses]     = useState({});
  const [priorities, setPriorities] = useState({});
  const [notes, setNotes]           = useState({});
  const [savedNotes, setSavedNotes] = useState({});
  const [checked, setChecked]       = useState(new Set());
  const [sortBy, setSortBy]         = useState("newest");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showFilters, setShowFilters]       = useState(false);

  // Enrich with local overrides
  const enriched = allData.map(q => ({
    ...q,
    status:   statuses[q.id]   || q.status,
    priority: priorities[q.id] || q.priority,
  }));

  const afterFilter = enriched
    .filter(q => filterStatus   === "all" || q.status   === filterStatus)
    .filter(q => filterPriority === "all" || q.priority === filterPriority);

  const afterSearch = afterFilter.filter(q =>
    !search ||
    q.name.toLowerCase().includes(search.toLowerCase()) ||
    q.email.toLowerCase().includes(search.toLowerCase()) ||
    q.mobile.includes(search) ||
    q.equipment.toLowerCase().includes(search.toLowerCase()) ||
    q.location.toLowerCase().includes(search.toLowerCase())
  );

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sortBy === "name")     return a.name.localeCompare(b.name);
    if (sortBy === "oldest")   return a.id - b.id;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated  = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = {
    open:        enriched.filter(q => q.status === "open").length,
    in_progress: enriched.filter(q => q.status === "in_progress").length,
    high:        enriched.filter(q => q.priority === "high").length,
    closed:      enriched.filter(q => q.status === "closed").length,
  };

  const handleStatusChange   = (id, val) => { setStatuses(p  => ({ ...p, [id]: val })); setSelected(p => p?.id === id ? { ...p, status: val }   : p); };
  const handlePriorityChange = (id, val) => { setPriorities(p => ({ ...p, [id]: val })); setSelected(p => p?.id === id ? { ...p, priority: val } : p); };
  const handleNotesSave      = (id)      => setSavedNotes(p => ({ ...p, [id]: notes[id] }));

  const toggleCheck = (id) => setChecked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll   = () => setChecked(checked.size === paginated.length ? new Set() : new Set(paginated.map(q => q.id)));
  const bulkStatus  = (st) => { const u = {}; checked.forEach(id => { u[id] = st; }); setStatuses(p => ({ ...p, ...u })); setChecked(new Set()); };
  const doExport    = () => exportCSV(checked.size > 0 ? sorted.filter(q => checked.has(q.id)) : sorted);

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1); setSelected(null); }, [search, filterStatus, filterPriority, sortBy]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] animate-fade-in">

      {/* ── Dark banner with inline stats ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-slate-800 to-slate-900 px-6 py-5 shrink-0">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Customer Inquiries</h1>
            <p className="text-xs text-slate-400 mt-0.5">Equipment rental and availability enquiries</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-bold text-white">{allData.length}</span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm font-bold text-blue-300">{counts.open}</span>
              <span className="text-[10px] text-slate-400">Open</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">{counts.in_progress}</span>
              <span className="text-[10px] text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-bold text-red-300">{counts.high}</span>
              <span className="text-[10px] text-slate-400">High Priority</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">{counts.closed}</span>
              <span className="text-[10px] text-slate-400">Closed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={doExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── Two separate cards ── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* LEFT — list card (bg-slate-50 so white rows pop) */}
        <div className="flex flex-col w-full lg:w-[46%] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">

          {/* Toolbar */}
          <div className="px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2
                focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Name, equipment, location…"
                  className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full" />
                {search && (
                  <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilters(f => !f)}
                className={`p-2 rounded-lg border transition-all cursor-pointer
                  ${showFilters ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFilters && (
              <div className="space-y-1.5">
                {/* Status filter */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 w-12 shrink-0">Status</span>
                  <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5 flex-wrap">
                    {["all","open","in_progress","closed","spam"].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer
                          ${filterStatus === s ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                        {s.replace("_"," ")}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Priority filter + Sort */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 w-12 shrink-0">Priority</span>
                  <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-0.5">
                    {["all","high","medium","low"].map(s => (
                      <button key={s} onClick={() => setFilterPriority(s)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer
                          ${filterPriority === s ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="ml-auto text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer">
                    <option value="newest">↓ Newest</option>
                    <option value="oldest">↑ Oldest</option>
                    <option value="priority">↑ Priority</option>
                    <option value="name">A→Z Name</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk action bar */}
          {checked.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
              <span className="text-[11px] font-bold text-orange-700">{checked.size} selected</span>
              <div className="flex items-center gap-1 ml-auto flex-wrap">
                {[
                  { st: "in_progress", label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200"  },
                  { st: "closed",      label: "Closed",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  { st: "spam",        label: "Spam",        cls: "bg-red-50 text-red-600 border-red-200"         },
                ].map(b => (
                  <button key={b.st} onClick={() => bulkStatus(b.st)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${b.cls}`}>
                    {b.label}
                  </button>
                ))}
                <button onClick={() => setChecked(new Set())}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 bg-white text-slate-500 cursor-pointer">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 border-b border-slate-200 shrink-0">
            <button onClick={toggleAll} className="shrink-0 text-slate-300 hover:text-orange-500 cursor-pointer transition-colors">
              {checked.size === paginated.length && paginated.length > 0
                ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
            </button>
            <span className="w-8 shrink-0" />
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">Customer</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden md:block pr-2">Priority</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block pr-4">Status</p>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No results</p>
                <p className="text-xs text-slate-400 mt-1">Adjust filters or search</p>
              </div>
            ) : (
              paginated.map(item => (
                <InquiryRow key={item.id} item={item} onClick={setSelected}
                  isSelected={selected?.id === item.id}
                  isChecked={checked.has(item.id)}
                  onCheck={toggleCheck} />
              ))
            )}
          </div>

          <Pagination
            current={page} last={totalPages} total={sorted.length}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          />
        </div>

        {/* RIGHT — detail card (pure white) */}
        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DetailPanel
            item={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onNotesSave={handleNotesSave}
            notes={notes}
            setNotes={setNotes}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <DetailPanel item={selected} onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange} onPriorityChange={handlePriorityChange}
              onNotesSave={handleNotesSave} notes={notes} setNotes={setNotes} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;