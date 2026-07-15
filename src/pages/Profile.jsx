import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  Shield,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
  Star,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  BadgeCheck,
  Clock,
  Globe,
  ArrowUpRight,
  Settings,
  Edit3,
} from "lucide-react";

// ─── Copy hook ───────────────────────────────────────────────────────────────
const useCopy = () => {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };
  return { copied, copy };
};

// ─── Field row ───────────────────────────────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, copyKey, onCopy, isCopied }) => (
  <div className="flex items-start gap-3 py-3 group">
    <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
      <Icon className="w-3.5 h-3.5 text-zinc-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      {value ? (
        <p className="text-[13px] font-semibold text-zinc-800 wrap-break-word leading-snug">
          {value}
        </p>
      ) : (
        <p className="text-[12px] text-zinc-300 italic">Not provided</p>
      )}
    </div>
    {value && copyKey && (
      <button
        onClick={() => onCopy(value, copyKey)}
        title="Copy"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-orange-50 text-zinc-300 hover:text-orange-500 transition-all cursor-pointer shrink-0"
      >
        {isCopied ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    )}
  </div>
);

// ─── Profile completeness ring ────────────────────────────────────────────────
const CompletionRing = ({ percent }) => {
  const r = 26,
    c = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (percent / 100) * c}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-white">{percent}%</span>
      </div>
    </div>
  );
};

// ─── KPI tile (hero strip) ─────────────────────────────────────────────────────
const HeroKpi = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5">
    <Icon className="w-4 h-4 text-orange-200 shrink-0" />
    <div>
      <p className="text-sm font-bold text-white leading-none">{value}</p>
      <p className="text-[10px] text-orange-100/70 font-medium mt-1">{label}</p>
    </div>
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, action }) => (
  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-[13px] font-bold text-zinc-800">{title}</h3>
      </div>
      {action}
    </div>
    <div className="px-5 divide-y divide-zinc-100">{children}</div>
  </div>
);

// ─── Timeline item (account activity) ─────────────────────────────────────────
const TimelineItem = ({ icon: Icon, title, time, isLast, color }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div
        className={`w-7 h-7 rounded-full ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      {!isLast && <div className="w-px flex-1 bg-zinc-200 my-1" />}
    </div>
    <div className="pb-4">
      <p className="text-[13px] font-semibold text-zinc-800">{title}</p>
      <p className="text-[11px] text-zinc-400 mt-0.5">{time}</p>
    </div>
  </div>
);

// ─── Profile page ─────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, fetchProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);
  const { copied, copy } = useCopy();

  // console.log("user", user);

  useEffect(() => {
    if (!user) fetchProfile().finally(() => setIsLoading(false));
  }, [user, fetchProfile]);

  if (isLoading || loading)
    return <Loader fullScreen={false} text="Loading profile…" />;

  const displayName =
    user?.brand_name || user?.name || user?.username || "Partner";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSinceFull = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // crude profile-completeness calc
  const fields = [
    user?.brand_name,
    user?.company_name,
    user?.gst,
    user?.office_address,
    user?.email,
    user?.phone_no || user?.phone,
  ];
  const completion = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100,
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-zinc-900 via-orange-950 to-orange-700 px-6 sm:px-8 py-7">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600
              flex items-center justify-center ring-4 ring-white/20 shadow-xl shrink-0"
            >
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-sm text-orange-100/70 capitalize">
                {user?.company_name || "Brand Partner"} · @{user?.username}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-100/60">
                <Clock className="w-3 h-3" />
                Partner since {memberSinceFull}
              </div>
            </div>
          </div>

          {/* KPIs + completion ring */}
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <HeroKpi icon={TrendingUp} label="Total Leads" value="1,284" />
              <HeroKpi icon={Star} label="Rating" value="4.8 ★" />
              <HeroKpi icon={Zap} label="Plan" value="Premium" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl pl-2 pr-3 py-2">
              <CompletionRing percent={completion} />
              <div>
                <p className="text-[11px] font-semibold text-white">Profile</p>
                <p className="text-[10px] text-orange-100/60">Strength</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left — details (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Section title="Business Details" icon={Building2}>
            <FieldRow
              icon={Building2}
              label="Brand Name"
              value={user?.brand_name}
              copyKey="brand"
              onCopy={copy}
              isCopied={copied === "brand"}
            />
            <FieldRow
              icon={Building2}
              label="Company Name"
              value={user?.company_name}
              copyKey="company"
              onCopy={copy}
              isCopied={copied === "company"}
            />
            <FieldRow
              icon={FileText}
              label="GST Number"
              value={user?.gst}
              copyKey="gst"
              onCopy={copy}
              isCopied={copied === "gst"}
            />
            <FieldRow
              icon={MapPin}
              label="Office Address"
              value={user?.office_address}
            />
          </Section>

          <Section title="Contact Details" icon={Mail}>
            <FieldRow
              icon={User}
              label="Username"
              value={user?.username}
              copyKey="uname"
              onCopy={copy}
              isCopied={copied === "uname"}
            />
            <FieldRow
              icon={Mail}
              label="Email"
              value={user?.email}
              copyKey="email"
              onCopy={copy}
              isCopied={copied === "email"}
            />
            <FieldRow
              icon={Phone}
              label="Phone Number"
              value={user?.phone_no || user?.phone}
              copyKey="phone"
              onCopy={copy}
              isCopied={copied === "phone"}
            />
          </Section>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Account status card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <h3 className="text-[13px] font-bold text-zinc-800">
                Account Status
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  Account Type
                </span>
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" /> Premium
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  Portal Access
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  Verification
                </span>
                <span className="inline-flex items-center gap-1 text-blue-600 text-[12px] font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Complete
                </span>
              </div>
              <div className="pt-3 mt-1 border-t border-zinc-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 font-medium">
                    Profile completeness
                  </span>
                  <span className="font-bold text-zinc-700">{completion}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-orange-500 to-amber-400 rounded-full transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity timeline */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <h3 className="text-[13px] font-bold text-zinc-800">
                  Account Activity
                </h3>
              </div>
            </div>
            <div className="p-5 pb-1">
              <TimelineItem
                icon={CheckCircle}
                title="Profile verified"
                time={memberSinceFull}
                color="bg-emerald-500"
              />
              <TimelineItem
                icon={User}
                title="Account created"
                time={memberSinceFull}
                color="bg-blue-500"
              />
              <TimelineItem
                icon={Star}
                title="Upgraded to Premium"
                time={memberSinceFull}
                color="bg-amber-500"
                isLast
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
