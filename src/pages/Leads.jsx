import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Phone, Mail, Search, ChevronLeft, ChevronRight,
  X, Download, CheckSquare, Square, SlidersHorizontal,
  Users, ArrowRight, MapPin, Wrench, Calendar,
  Save, TrendingUp, Trophy, XCircle, Flame,
  Sun, Snowflake, Globe, MessageCircleCode , MessageCircle,
  Building2, IndianRupee, Clock, Target, Megaphone,
  CheckCircle, ChevronRight as ChevronRightIcon,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_LEADS = [
  { id: 1,  name: "Rajan Verma",      company: "Verma Constructions Pvt Ltd",     email: "rajan.verma@vermaconst.in",       mobile: "9876501234", equipment: "Tower Crane",       location: "Delhi NCR",       budget: "₹2–3 L/month",  deal_value: 600000,  stage: "proposal",   score: "hot",  source: "Google Ads",  last_activity: "2h ago",   close_date: "2026-07-15", notes: "", win_loss_reason: "" },
  { id: 2,  name: "Sneha Bhatia",     company: "Bhatia Infratech",               email: "sneha.bhatia@bhatiainfra.com",     mobile: "9765432108", equipment: "Excavator 20T",     location: "Pune",            budget: "₹80K–1 L/month",deal_value: 240000,  stage: "qualified",  score: "hot",  source: "Referral",    last_activity: "5h ago",   close_date: "2026-07-10", notes: "", win_loss_reason: "" },
  { id: 3,  name: "Mohit Agarwal",    company: "Agarwal Road Projects",          email: "mohit@agarwalroadprojects.in",     mobile: "9654321987", equipment: "Motor Grader",      location: "Jaipur",          budget: "₹1–1.5 L/month",deal_value: 300000,  stage: "contacted",  score: "warm", source: "Website",     last_activity: "1d ago",   close_date: "2026-08-01", notes: "", win_loss_reason: "" },
  { id: 4,  name: "Divya Menon",      company: "Menon Builders Kerala",          email: "divya.menon@menonbuilders.in",     mobile: "9543210876", equipment: "Concrete Pump",     location: "Kochi",           budget: "₹50K–70K/month",deal_value: 140000,  stage: "new",        score: "warm", source: "MessageCircleCode ",    last_activity: "2d ago",   close_date: "2026-08-15", notes: "", win_loss_reason: "" },
  { id: 5,  name: "Harish Chandra",   company: "HC Mining Solutions",            email: "harish.c@hcmining.co.in",          mobile: "9432109765", equipment: "Dumper Truck ×8",   location: "Nagpur",          budget: "₹4–5 L/month",  deal_value: 1200000, stage: "proposal",   score: "hot",  source: "Trade Show",  last_activity: "3h ago",   close_date: "2026-07-05", notes: "", win_loss_reason: "" },
  { id: 6,  name: "Preethi Nair",     company: "Nair Interiors & Fit-out",       email: "preethi.nair@nairinteriors.com",   mobile: "9321098654", equipment: "Scissor Lift ×4",   location: "Bengaluru",       budget: "₹60K–80K/month",deal_value: 160000,  stage: "won",        score: "hot",  source: "WhatsApp",    last_activity: "1w ago",   close_date: "2026-06-20", notes: "Closed successfully. Client very happy.", win_loss_reason: "Best price + on-time delivery" },
  { id: 7,  name: "Sanjay Kulkarni",  company: "Kulkarni Civil Works",           email: "sanjay.k@kulkarnicivil.in",        mobile: "9210987543", equipment: "Boom Lift 30m",     location: "Nashik",          budget: "₹40K–60K/month",deal_value: 100000,  stage: "lost",       score: "cold", source: "Website",     last_activity: "2w ago",   close_date: "2026-06-10", notes: "", win_loss_reason: "Competitor offered lower rate" },
  { id: 8,  name: "Ananya Das",       company: "Das Port Logistics",             email: "ananya.das@daslogistics.in",       mobile: "9109876432", equipment: "Reach Stacker",     location: "Kolkata",         budget: "₹1.5–2 L/month",deal_value: 420000,  stage: "qualified",  score: "hot",  source: "Direct Call", last_activity: "6h ago",   close_date: "2026-07-20", notes: "", win_loss_reason: "" },
  { id: 9,  name: "Vikrant Tiwari",   company: "Tiwari Power Infrastructure",    email: "vikrant.t@tiwaripower.com",        mobile: "9098765321", equipment: "Crane Truck 50T",   location: "Bhopal",          budget: "₹90K–1.2L/month",deal_value: 280000,  stage: "contacted",  score: "warm", source: "Google Ads",  last_activity: "1d ago",   close_date: "2026-08-05", notes: "", win_loss_reason: "" },
  { id: 10, name: "Kavitha Reddy",    company: "Reddy Housing Developments",     email: "kavitha.r@reddyhousing.in",        mobile: "9876543120", equipment: "Tower Crane Luffing",location: "Hyderabad",      budget: "₹3–4 L/month",  deal_value: 840000,  stage: "new",        score: "cold", source: "MessageCircleCode ",    last_activity: "3d ago",   close_date: "2026-09-01", notes: "", win_loss_reason: "" },
  { id: 11, name: "Ashish Mehrotra",  company: "Mehrotra Road Corp",             email: "ashish.m@mehrotraroad.in",         mobile: "9765432019", equipment: "Paver Machine",     location: "Lucknow",         budget: "₹70K–90K/month",deal_value: 210000,  stage: "proposal",   score: "warm", source: "Referral",    last_activity: "4h ago",   close_date: "2026-07-25", notes: "", win_loss_reason: "" },
  { id: 12, name: "Tanvi Shah",       company: "Shah Textile Mills",             email: "tanvi.shah@shahtextile.com",       mobile: "9654320198", equipment: "Forklift ×3",       location: "Surat",           budget: "₹45K–65K/month",deal_value: 130000,  stage: "new",        score: "cold", source: "Website",     last_activity: "5d ago",   close_date: "2026-09-15", notes: "", win_loss_reason: "" },
  { id: 13, name: "Ramesh Pillai",    company: "Pillai Marine Works",            email: "ramesh.p@pillaimarine.in",         mobile: "9543201987", equipment: "Crawler Crane",     location: "Visakhapatnam",   budget: "₹2–3 L/month",  deal_value: 700000,  stage: "qualified",  score: "hot",  source: "Trade Show",  last_activity: "1d ago",   close_date: "2026-07-30", notes: "", win_loss_reason: "" },
  { id: 14, name: "Neelam Choudhary", company: "Choudhary Agricultural Infra",  email: "neelam.c@choudharyagri.co.in",    mobile: "9432019876", equipment: "Backhoe Loader",    location: "Indore",          budget: "₹30K–50K/month",deal_value: 90000,   stage: "contacted",  score: "cold", source: "WhatsApp",    last_activity: "2d ago",   close_date: "2026-08-20", notes: "", win_loss_reason: "" },
  { id: 15, name: "Gautam Singhania", company: "Singhania Mega Projects Ltd",    email: "gautam.s@singhaniamega.com",       mobile: "9321098765", equipment: "Multiple Units",    location: "Mumbai",          budget: "₹10–15 L/month",deal_value: 3600000, stage: "proposal",   score: "hot",  source: "Direct Call", last_activity: "1h ago",   close_date: "2026-07-08", notes: "High-value deal. CEO-level contact.", win_loss_reason: "" },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const STAGES = [
  { value: "new",       label: "New",           color: "text-slate-600",   bg: "bg-slate-100",    border: "border-slate-200",   dot: "bg-slate-400",    rowBorder: "border-l-slate-300",    step: 1 },
  { value: "contacted", label: "Contacted",     color: "text-blue-700",    bg: "bg-blue-50",      border: "border-blue-200",    dot: "bg-blue-500",     rowBorder: "border-l-blue-400",     step: 2 },
  { value: "qualified", label: "Qualified",     color: "text-violet-700",  bg: "bg-violet-50",    border: "border-violet-200",  dot: "bg-violet-500",   rowBorder: "border-l-violet-400",   step: 3 },
  { value: "proposal",  label: "Proposal Sent", color: "text-amber-700",   bg: "bg-amber-50",     border: "border-amber-200",   dot: "bg-amber-500",    rowBorder: "border-l-amber-400",    step: 4 },
  { value: "won",       label: "Won",           color: "text-emerald-700", bg: "bg-emerald-50",   border: "border-emerald-200", dot: "bg-emerald-500",  rowBorder: "border-l-emerald-500",  step: 5 },
  { value: "lost",      label: "Lost",          color: "text-red-600",     bg: "bg-red-50",       border: "border-red-200",     dot: "bg-red-400",      rowBorder: "border-l-red-300",      step: 5 },
];

const SCORES = [
  { value: "hot",  label: "Hot",  icon: Flame,    color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    ring: "ring-red-200",    header: "from-red-50 to-orange-50/60 border-red-200"    },
  { value: "warm", label: "Warm", icon: Sun,      color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  ring: "ring-amber-200",  header: "from-amber-50 to-yellow-50/60 border-amber-200"  },
  { value: "cold", label: "Cold", icon: Snowflake,color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   ring: "ring-blue-200",   header: "from-blue-50 to-slate-50/60 border-blue-100"   },
];

const SOURCES_MAP = {
  "Google Ads":  { icon: Target,         color: "text-orange-600", bg: "bg-orange-50 border-orange-200"  },
  "MessageCircleCode ":    { icon: MessageCircleCode ,       color: "text-blue-600",   bg: "bg-blue-50 border-blue-200"      },
  "Website":     { icon: Globe,          color: "text-violet-600", bg: "bg-violet-50 border-violet-200"  },
  "Referral":    { icon: Users,          color: "text-emerald-600",bg: "bg-emerald-50 border-emerald-200"},
  "Trade Show":  { icon: Megaphone,      color: "text-pink-600",   bg: "bg-pink-50 border-pink-200"      },
  "Direct Call": { icon: Phone,          color: "text-slate-600",  bg: "bg-slate-100 border-slate-200"   },
  "WhatsApp":    { icon: MessageCircle,  color: "text-green-600",  bg: "bg-green-50 border-green-200"    },
};

const PIPELINE_STEPS = ["new","contacted","qualified","proposal"];

const getStage  = (v) => STAGES.find(s => s.value === v) || STAGES[0];
const getScore  = (v) => SCORES.find(s => s.value === v) || SCORES[1];
const getSource = (v) => SOURCES_MAP[v] || SOURCES_MAP["Website"];

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const fmtValue = (v) =>
  v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`;

const exportCSV = (rows) => {
  const h = ["ID","Name","Company","Email","Mobile","Equipment","Location","Budget","Deal Value","Stage","Score","Source","Close Date"];
  const lines = rows.map(r => [r.id,r.name,r.company,r.email,r.mobile,r.equipment,r.location,r.budget,r.deal_value,r.stage,r.score,r.source,r.close_date].join(","));
  const blob = new Blob([[h.join(","),...lines].join("\n")],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download=`leads_${Date.now()}.csv`; a.click();
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, score, size = "sm" }) => {
  const s   = getScore(score);
  const sz  = size === "md" ? "w-10 h-10 text-[11px]" : "w-8 h-8 text-[10px]";
  const ScoreIcon = s.icon;
  return (
    <div className={`relative ${sz} rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0`}>
      {getInitials(name)}
      <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm`}>
        <ScoreIcon className={`w-2.5 h-2.5 ${s.color}`} />
      </span>
    </div>
  );
};

const StageBadge = ({ stage }) => {
  const s = getStage(stage);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.border} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
};

const ScoreBadge = ({ score }) => {
  const s = getScore(score);
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.border} ${s.color}`}>
      <Icon className="w-2.5 h-2.5" />{s.label}
    </span>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
    <div className="w-4 h-4 rounded bg-slate-100 shrink-0" />
    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-slate-200 rounded w-32" />
      <div className="h-2 bg-slate-100 rounded w-24" />
    </div>
    <div className="h-4 bg-slate-100 rounded-full w-14 hidden md:block" />
    <div className="h-4 bg-slate-100 rounded-full w-16 hidden lg:block" />
  </div>
);

// ─── Pipeline stage tracker ───────────────────────────────────────────────────
const StageTracker = ({ stage, onStageChange, leadId }) => {
  const isTerminal = stage === "won" || stage === "lost";
  return (
    <div>
      {/* Active pipeline steps */}
      <div className="flex items-center gap-0 mb-2">
        {PIPELINE_STEPS.map((st, idx) => {
          const s        = getStage(st);
          const current  = getStage(stage);
          const active   = !isTerminal && current.step > s.step;
          const isCurrent= !isTerminal && stage === st;
          return (
            <div key={st} className="flex items-center flex-1">
              <button
                onClick={() => onStageChange(leadId, st)}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-all group flex-1`}
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                  ${isCurrent ? "border-orange-500 bg-orange-500" : active ? "border-emerald-500 bg-emerald-500" : "border-slate-200 bg-white group-hover:border-slate-400"}`}>
                  {active
                    ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                    : <span className={`text-[9px] font-bold ${isCurrent ? "text-white" : "text-slate-400"}`}>{idx + 1}</span>
                  }
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight hidden sm:block
                  ${isCurrent ? "text-orange-600" : active ? "text-emerald-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </button>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 -mx-1 ${active ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Won / Lost terminal buttons */}
      <div className="flex gap-2 mt-3">
        <button onClick={() => onStageChange(leadId, "won")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer
            ${stage === "won"
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}>
          <Trophy className="w-3.5 h-3.5" /> Mark Won
        </button>
        <button onClick={() => onStageChange(leadId, "lost")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer
            ${stage === "lost"
              ? "bg-red-500 text-white border-red-500 shadow-sm"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
          <XCircle className="w-3.5 h-3.5" /> Mark Lost
        </button>
      </div>
    </div>
  );
};

// ─── Lead row ─────────────────────────────────────────────────────────────────
const LeadRow = ({ lead, onClick, isSelected, isChecked, onCheck }) => {
  const stage = getStage(lead.stage);
  return (
    <div
      onClick={() => onClick(lead)}
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 cursor-pointer
        transition-colors duration-100 select-none border-l-[3px] ${stage.rowBorder}
        ${isSelected ? "bg-orange-50" : "bg-white hover:bg-slate-50"}`}
    >
      <button onClick={e => { e.stopPropagation(); onCheck(lead.id); }}
        className="shrink-0 text-slate-300 hover:text-orange-500 transition-colors cursor-pointer">
        {isChecked ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4" />}
      </button>

      <Avatar name={lead.name} score={lead.score} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className={`text-[13px] font-semibold truncate ${isSelected ? "text-orange-700" : "text-slate-800"}`}>
            {lead.name}
          </p>
          <span className="text-[10px] text-slate-300 font-mono shrink-0">#{lead.id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-[11px] text-slate-500 truncate font-medium">{lead.company}</span>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
        <ScoreBadge score={lead.score} />
        <span className="text-[10px] font-bold text-slate-500">{fmtValue(lead.deal_value)}</span>
      </div>

      <div className="hidden lg:block shrink-0">
        <StageBadge stage={lead.stage} />
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0 hidden xl:flex">
        <span className="text-[10px] text-slate-300 whitespace-nowrap">{lead.last_activity}</span>
      </div>

      <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isSelected ? "text-orange-400" : "text-slate-200"}`} />
    </div>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ lead, onClose, onStageChange, onScoreChange, notes, setNotes, onNotesSave }) => {
  if (!lead) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
        <TrendingUp className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-400">No lead selected</p>
      <p className="text-xs text-slate-300 mt-1">Click a row on the left to view details</p>
    </div>
  );

  const score  = getScore(lead.score);
  const stage  = getStage(lead.stage);
  const src    = getSource(lead.source);
  const SrcIcon= src.icon;
  const ScIcon = score.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Score-tinted header */}
      <div className={`px-5 py-4 bg-gradient-to-r border-b ${score.header} shrink-0`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={lead.name} score={lead.score} size="md" />
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-900 truncate">{lead.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-600 font-semibold truncate">{lead.company}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <ScoreBadge score={lead.score} />
                <StageBadge stage={lead.stage} />
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${src.bg} ${src.color}`}>
                  <SrcIcon className="w-2.5 h-2.5" />{lead.source}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-slate-900">{fmtValue(lead.deal_value)}</p>
              <p className="text-[10px] text-slate-400 font-medium">Deal Value</p>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/70 hover:text-slate-600 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100">

        {/* Contact */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact</p>
          <div className="space-y-1.5">
            <a href={`mailto:${lead.email}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/60 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                <p className="text-[12px] font-semibold text-slate-700 truncate group-hover:text-orange-600 transition-colors">{lead.email}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-orange-400 shrink-0" />
            </a>
            <a href={`tel:${lead.mobile}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 transition-all cursor-pointer group">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</p>
                <p className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{lead.mobile}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-blue-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Deal info */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Deal Details</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Wrench,      label: "Equipment",  value: lead.equipment  },
              { icon: MapPin,      label: "Location",   value: lead.location   },
              { icon: IndianRupee, label: "Budget",     value: lead.budget     },
              { icon: Calendar,    label: "Close Date", value: lead.close_date || "Not set" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
                <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
                  <p className="text-[12px] font-bold text-slate-700 leading-snug">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline stage tracker */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pipeline Stage</p>
          <StageTracker stage={lead.stage} onStageChange={onStageChange} leadId={lead.id} />

          {/* Win/Loss reason */}
          {(lead.stage === "won" || lead.stage === "lost") && lead.win_loss_reason && (
            <div className={`mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold
              ${lead.stage === "won" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
              {lead.stage === "won" ? <Trophy className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              {lead.win_loss_reason}
            </div>
          )}
        </div>

        {/* Lead score picker */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Lead Score</p>
          <div className="flex gap-2">
            {SCORES.map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.value} onClick={() => onScoreChange(lead.id, opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer
                    ${lead.score === opt.value
                      ? `${opt.bg} ${opt.border} ${opt.color} ring-2 ${opt.ring}`
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"}`}>
                  <Icon className="w-3.5 h-3.5" />{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Last activity */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Activity</p>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Last Activity</p>
              <p className="text-[12px] font-semibold text-slate-700">{lead.last_activity}</p>
            </div>
          </div>
        </div>

        {/* Internal notes */}
        <div className="px-5 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Internal Notes
            <span className="ml-1.5 text-slate-300 font-normal normal-case tracking-normal">(not visible to customer)</span>
          </p>
          <textarea
            value={notes[lead.id] || lead.notes || ""}
            onChange={e => setNotes(p => ({ ...p, [lead.id]: e.target.value }))}
            placeholder="Add follow-up notes, meeting details, or reminders…"
            rows={3}
            className="w-full text-[12px] text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200
              rounded-xl px-3 py-2.5 outline-none resize-none
              focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
          />
          <button onClick={() => onNotesSave(lead.id)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold transition-colors cursor-pointer">
            <Save className="w-3 h-3" /> Save Notes
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 p-4 bg-white border-t border-slate-100 shrink-0">
        <a href={`mailto:${lead.email}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-orange-500/20">
          <Mail className="w-4 h-4" /> Send Email
        </a>
        <a href={`tel:${lead.mobile}`}
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
      <span className="font-bold text-slate-600">{total}</span> leads · pg{" "}
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
const Leads = () => {
  const ITEMS_PER_PAGE = 8;

  const [allData]                       = useState(MOCK_LEADS);
  const [page, setPage]                 = useState(1);
  const [selected, setSelected]         = useState(null);
  const [search, setSearch]             = useState("");
  const [stages, setStages]             = useState({});
  const [scores, setScores]             = useState({});
  const [notes, setNotes]               = useState({});
  const [checked, setChecked]           = useState(new Set());
  const [sortBy, setSortBy]             = useState("newest");
  const [filterStage, setFilterStage]   = useState("all");
  const [filterScore, setFilterScore]   = useState("all");
  const [showFilters, setShowFilters]   = useState(false);

  const enriched = allData.map(l => ({
    ...l,
    stage: stages[l.id] || l.stage,
    score: scores[l.id] || l.score,
  }));

  const afterFilter = enriched
    .filter(l => filterStage === "all" || l.stage === filterStage)
    .filter(l => filterScore === "all" || l.score === filterScore);

  const afterSearch = afterFilter.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.mobile.includes(search) ||
    l.equipment.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase())
  );

  const SCORE_ORDER = { hot: 0, warm: 1, cold: 2 };
  const STAGE_ORDER = { proposal: 0, qualified: 1, contacted: 2, new: 3, won: 4, lost: 5 };
  const sorted = [...afterSearch].sort((a, b) => {
    if (sortBy === "score")    return SCORE_ORDER[a.score] - SCORE_ORDER[b.score];
    if (sortBy === "stage")    return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
    if (sortBy === "value")    return b.deal_value - a.deal_value;
    if (sortBy === "name")     return a.name.localeCompare(b.name);
    if (sortBy === "oldest")   return a.id - b.id;
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated  = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pipelineValue = enriched
    .filter(l => !["won","lost"].includes(l.stage))
    .reduce((s, l) => s + l.deal_value, 0);

  const counts = {
    hot:  enriched.filter(l => l.score === "hot").length,
    new:  enriched.filter(l => l.stage === "new").length,
    won:  enriched.filter(l => l.stage === "won").length,
    lost: enriched.filter(l => l.stage === "lost").length,
  };

  const handleStageChange = (id, val) => {
    setStages(p  => ({ ...p, [id]: val }));
    setSelected(p => p?.id === id ? { ...p, stage: val } : p);
  };
  const handleScoreChange = (id, val) => {
    setScores(p  => ({ ...p, [id]: val }));
    setSelected(p => p?.id === id ? { ...p, score: val } : p);
  };
  const handleNotesSave = (id) => console.log("Notes saved for", id, notes[id]);

  const toggleCheck = (id) => setChecked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll   = () => setChecked(checked.size === paginated.length ? new Set() : new Set(paginated.map(l => l.id)));
  const bulkStage   = (st) => { const u = {}; checked.forEach(id => { u[id] = st; }); setStages(p => ({ ...p, ...u })); setChecked(new Set()); };
  const doExport    = () => exportCSV(checked.size > 0 ? sorted.filter(l => checked.has(l.id)) : sorted);

  useEffect(() => { setPage(1); setSelected(null); }, [search, filterStage, filterScore, sortBy]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-88px)] animate-fade-in">

      {/* ── Dark banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-slate-800 to-slate-900 px-6 py-5 shrink-0">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Leads</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track and manage your sales pipeline</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Users className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-bold text-white">{allData.length}</span>
              <span className="text-[10px] text-slate-400">Total</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-bold text-red-300">{counts.hot}</span>
              <span className="text-[10px] text-slate-400">Hot</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">{counts.won}</span>
              <span className="text-[10px] text-slate-400">Won</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-sm font-bold text-red-300">{counts.lost}</span>
              <span className="text-[10px] text-slate-400">Lost</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">{fmtValue(pipelineValue)}</span>
              <span className="text-[10px] text-slate-400">Pipeline</span>
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

        {/* LEFT — list (bg-slate-50, white rows pop within it) */}
        <div className="flex flex-col w-full lg:w-[46%] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">

          {/* Toolbar */}
          <div className="px-3 py-2.5 bg-white border-b border-slate-200 shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2
                focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Name, company, equipment…"
                  className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full" />
                {search && <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <button onClick={() => setShowFilters(f => !f)}
                className={`p-2 rounded-lg border transition-all cursor-pointer
                  ${showFilters ? "border-orange-300 bg-orange-50 text-orange-600" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFilters && (
              <div className="space-y-1.5">
                {/* Stage filter */}
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5 w-10 shrink-0">Stage</span>
                  <div className="flex flex-wrap gap-1">
                    {["all","new","contacted","qualified","proposal","won","lost"].map(s => (
                      <button key={s} onClick={() => setFilterStage(s)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer
                          ${filterStage === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Score filter + Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-10 shrink-0">Score</span>
                  <div className="flex gap-1">
                    {["all","hot","warm","cold"].map(s => (
                      <button key={s} onClick={() => setFilterScore(s)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition-all cursor-pointer
                          ${filterScore === s ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="ml-auto text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer">
                    <option value="newest">↓ Newest</option>
                    <option value="oldest">↑ Oldest</option>
                    <option value="score">↑ Score</option>
                    <option value="stage">↑ Stage</option>
                    <option value="value">₹ Value</option>
                    <option value="name">A→Z</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bulk bar */}
          {checked.size > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
              <span className="text-[11px] font-bold text-orange-700">{checked.size} selected</span>
              <div className="flex items-center gap-1 ml-auto flex-wrap">
                {["contacted","qualified","proposal"].map(st => (
                  <button key={st} onClick={() => bulkStage(st)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 capitalize">
                    → {st}
                  </button>
                ))}
                <button onClick={() => bulkStage("won")}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer bg-emerald-50 border-emerald-200 text-emerald-700">
                  Won
                </button>
                <button onClick={() => setChecked(new Set())}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 bg-white text-slate-500 cursor-pointer">Clear</button>
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
            <p className="flex-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">Lead</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden md:block">Score · Value</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block pr-4">Stage</p>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No leads found</p>
                <p className="text-xs text-slate-400 mt-1">Adjust filters or search</p>
              </div>
            ) : (
              paginated.map(lead => (
                <LeadRow key={lead.id} lead={lead} onClick={setSelected}
                  isSelected={selected?.id === lead.id}
                  isChecked={checked.has(lead.id)}
                  onCheck={toggleCheck} />
              ))
            )}
          </div>

          <Pagination current={page} last={totalPages} total={sorted.length}
            onPrev={() => setPage(p => Math.max(1, p-1))}
            onNext={() => setPage(p => Math.min(totalPages, p+1))} />
        </div>

        {/* RIGHT — detail card */}
        <div className="hidden lg:flex flex-col flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <DetailPanel
            lead={selected}
            onClose={() => setSelected(null)}
            onStageChange={handleStageChange}
            onScoreChange={handleScoreChange}
            notes={notes}
            setNotes={setNotes}
            onNotesSave={handleNotesSave}
          />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <DetailPanel lead={selected} onClose={() => setSelected(null)}
              onStageChange={handleStageChange} onScoreChange={handleScoreChange}
              notes={notes} setNotes={setNotes} onNotesSave={handleNotesSave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;