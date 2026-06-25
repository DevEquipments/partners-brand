import { useAuth } from "../context/AuthContext";
import {
  Users,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
  FileText,
  Phone,
  Mail,
  Star,
  Zap,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  BarChart2,
  Inbox,
} from "lucide-react";

// ─── tiny primitives ────────────────────────────────────────────────────────

const Badge = ({ children, variant = "neutral" }) => {
  const styles = {
    neutral: "bg-zinc-100 text-zinc-600",
    green:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    orange:  "bg-orange-50  text-orange-700  border border-orange-200",
    blue:    "bg-blue-50    text-blue-700    border border-blue-200",
    amber:   "bg-amber-50   text-amber-700   border border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100">
    <div>
      <h2 className="text-[15px] font-bold text-zinc-900">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && (
      <button className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
        {action}
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ─── KPI card ───────────────────────────────────────────────────────────────

const KpiCard = ({ icon: Icon, label, value, delta, deltaLabel, accent }) => {
  const accents = {
    orange: { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500", ring: "ring-orange-100" },
    emerald:{ bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500", ring: "ring-emerald-100" },
    blue:   { bg: "bg-blue-50",    text: "text-blue-600",    bar: "bg-blue-500",    ring: "ring-blue-100" },
    amber:  { bg: "bg-amber-50",   text: "text-amber-600",   bar: "bg-amber-500",   ring: "ring-amber-100" },
  };
  const a = accents[accent] || accents.orange;
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-zinc-200 transition-all duration-200 group relative overflow-hidden">
      {/* subtle corner accent */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${a.bg} opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        <p className="text-xs font-medium text-zinc-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 leading-none mb-3">{value}</p>
        {delta !== undefined && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.text}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{delta} {deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Pipeline funnel ────────────────────────────────────────────────────────

const PIPELINE = [
  { stage: "New",       count: 84,  color: "bg-blue-500",    track: "bg-blue-100",    pct: 100 },
  { stage: "Contacted", count: 61,  color: "bg-orange-400",  track: "bg-orange-100",  pct: 73 },
  { stage: "Quoted",    count: 38,  color: "bg-amber-500",   track: "bg-amber-100",   pct: 45 },
  { stage: "Won",       count: 22,  color: "bg-emerald-500", track: "bg-emerald-100", pct: 26 },
];

const PipelineRow = ({ stage, count, color, track, pct }) => (
  <div className="flex items-center gap-4 py-3">
    <div className="w-20 shrink-0">
      <span className="text-xs font-semibold text-zinc-500">{stage}</span>
    </div>
    <div className={`flex-1 h-2 ${track} rounded-full overflow-hidden`}>
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
    <span className="w-8 text-right text-sm font-bold text-zinc-800 shrink-0">{count}</span>
  </div>
);

// ─── Activity feed ──────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    icon: Phone,
    title: "New lead — Delhi NCR",
    desc: "Inquiry about tower crane rental (6 months)",
    time: "2h ago",
    status: "new",
    bg: "bg-orange-50", fg: "text-orange-600",
  },
  {
    icon: Mail,
    title: "Quote sent to Sharma Constructions",
    desc: "Quotation #QT-2847 · ₹4.2 L/month",
    time: "4h ago",
    status: "sent",
    bg: "bg-blue-50", fg: "text-blue-600",
  },
  {
    icon: Star,
    title: "5-star review received",
    desc: "\"Delivered on time, excellent service\" — Gupta Infra",
    time: "6h ago",
    status: "review",
    bg: "bg-amber-50", fg: "text-amber-600",
  },
  {
    icon: CheckCircle2,
    title: "Lead won — Ravi Builders",
    desc: "Excavator ×2, 3-month contract",
    time: "Yesterday",
    status: "won",
    bg: "bg-emerald-50", fg: "text-emerald-600",
  },
  {
    icon: AlertCircle,
    title: "Follow-up overdue",
    desc: "Mehta Enterprises — no response in 3 days",
    time: "3d ago",
    status: "overdue",
    bg: "bg-red-50", fg: "text-red-500",
  },
];

const statusBadge = (s) => {
  const map = {
    new:     <Badge variant="orange">New</Badge>,
    sent:    <Badge variant="blue">Sent</Badge>,
    review:  <Badge variant="amber">Review</Badge>,
    won:     <Badge variant="green">Won</Badge>,
    overdue: <Badge variant="neutral">Overdue</Badge>,
  };
  return map[s] || null;
};

const ActivityRow = ({ item, isLast }) => (
  <div className="flex gap-3.5 px-6 py-3.5 hover:bg-zinc-50 transition-colors group">
    <div className="relative shrink-0 mt-0.5">
      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
        <item.icon className={`w-3.5 h-3.5 ${item.fg}`} />
      </div>
      {!isLast && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-zinc-100" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-zinc-800 leading-snug">{item.title}</p>
        {statusBadge(item.status)}
      </div>
      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
    </div>
    <div className="flex items-center gap-1 text-[11px] text-zinc-300 shrink-0 whitespace-nowrap mt-0.5">
      <Clock className="w-3 h-3" />
      {item.time}
    </div>
  </div>
);

// ─── Quick actions ───────────────────────────────────────────────────────────

const ACTIONS = [
  { icon: FileText, label: "New Quotation",   desc: "Create & send a quote",    bg: "bg-orange-50", fg: "text-orange-600" },
  { icon: Inbox,    label: "All Leads",        desc: "Browse & filter leads",    bg: "bg-blue-50",   fg: "text-blue-600" },
  { icon: Mail,     label: "Contact Support",  desc: "Talk to your account manager", bg: "bg-emerald-50", fg: "text-emerald-600" },
];

// ─── Metric bar ─────────────────────────────────────────────────────────────

const METRICS = [
  { label: "Response Rate",        value: 92, color: "bg-emerald-500", track: "bg-emerald-100" },
  { label: "Lead Conversion",      value: 67, color: "bg-orange-500",  track: "bg-orange-100" },
  { label: "Customer Satisfaction",value: 95, color: "bg-blue-500",    track: "bg-blue-100" },
  { label: "Profile Completion",   value: 85, color: "bg-amber-500",   track: "bg-amber-100" },
];

// ─── Dashboard page ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.brand_name || user?.name || user?.username || "Partner";

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-orange-950 to-orange-700 px-8 py-7 text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Live CRM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              Good morning, {displayName} 
            </h1>
            <p className="text-orange-100/70 text-sm mt-1.5 max-w-md">
              You have <span className="text-white font-semibold">5 open leads</span> and <span className="text-white font-semibold">2 follow-ups</span> due today.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-2 bg-white text-orange-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-md">
              <Zap className="w-4 h-4" />
              Quick Actions
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/15 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors">
              <BarChart2 className="w-4 h-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}        label="Total Leads"       value="1,284" delta="+12.5%" deltaLabel="vs last month" accent="orange" />
        <KpiCard icon={MessageSquare}label="Active Inquiries"  value="342"   delta="+8.2%"  deltaLabel="vs last month" accent="blue" />
        <KpiCard icon={TrendingUp}   label="Conversion Rate"  value="26.4%" delta="+3.1%"  deltaLabel="vs last month" accent="emerald" />
        <KpiCard icon={Star}         label="Avg. Rating"      value="4.8★"  delta="+0.2"  deltaLabel="since last week" accent="amber" />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Activity feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <SectionHeader title="Activity Feed" subtitle="Real-time updates across your leads" action="View all" />
          <div className="divide-y divide-zinc-50">
            {ACTIVITIES.map((a, i) => (
              <ActivityRow key={i} item={a} isLast={i === ACTIVITIES.length - 1} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Lead pipeline */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <SectionHeader title="Lead Pipeline" subtitle="This month's funnel" />
            <div className="px-6 py-4">
              {PIPELINE.map((p) => <PipelineRow key={p.stage} {...p} />)}
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total leads in pipeline</span>
                <span className="text-sm font-bold text-zinc-900">205</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <SectionHeader title="Performance" subtitle="Current month" />
            <div className="px-6 py-4 space-y-4">
              {METRICS.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-600">{m.label}</span>
                    <span className="text-xs font-bold text-zinc-900">{m.value}%</span>
                  </div>
                  <div className={`h-1.5 ${m.track} rounded-full overflow-hidden`}>
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <SectionHeader title="Quick Actions" />
            <div className="px-4 py-3 space-y-1.5">
              {ACTIONS.map((a) => (
                <button
                  key={a.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group text-left"
                >
                  <div className={`w-8 h-8 ${a.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-3.5 h-3.5 ${a.fg}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-zinc-800 leading-tight">{a.label}</p>
                    <p className="text-[11px] text-zinc-400">{a.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;