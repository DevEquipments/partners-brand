import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
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
} from 'lucide-react';

// ─── tiny copy-to-clipboard helper ──────────────────────────────────────────
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

// ─── field row inside an info section ───────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, copyKey, onCopy, isCopied }) => (
  <div className="flex items-start gap-4 py-4 border-b border-zinc-100 last:border-0 group">
    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-3.5 h-3.5 text-orange-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">{label}</p>
      {value ? (
        <p className="text-[13px] font-semibold text-zinc-800 break-words leading-relaxed">{value}</p>
      ) : (
        <p className="text-[13px] text-zinc-300 italic">Not provided</p>
      )}
    </div>
    {value && copyKey && (
      <button
        onClick={() => onCopy(value, copyKey)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-300 hover:text-zinc-500 transition-all"
        title="Copy"
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

// ─── section card ────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-zinc-100">
      <h3 className="text-[13px] font-bold text-zinc-900">{title}</h3>
    </div>
    <div className="px-6">{children}</div>
  </div>
);

// ─── stat pill ───────────────────────────────────────────────────────────────
const StatPill = ({ label, value, accent }) => {
  const colors = {
    orange:  'bg-orange-50  text-orange-600  border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue:    'bg-blue-50    text-blue-600    border-blue-100',
  };
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl border ${colors[accent]}`}>
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide mt-1 opacity-70">{label}</p>
    </div>
  );
};

// ─── Profile page ─────────────────────────────────────────────────────────────
const Profile = () => {
  const { user, fetchProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (!user) fetchProfile().finally(() => setIsLoading(false));
  }, [user, fetchProfile]);

  if (isLoading || loading) return <Loader fullScreen={false} text="Loading profile…" />;

  const displayName = user?.brand_name || user?.name || user?.username || 'Partner';
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
    : 'N/A';

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">My Profile</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Your brand partner details and account information</p>
      </div>

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {/* Cover strip */}
        <div className="h-28 sm:h-36 bg-gradient-to-br from-zinc-900 via-orange-950 to-orange-700 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          {/* subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Avatar row */}
        <div className="relative px-6 sm:px-8 pb-6">
          {/* Avatar */}
          <div className="absolute -top-10 left-6 sm:left-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600
              flex items-center justify-center ring-4 ring-white shadow-xl shadow-orange-500/20">
              <span className="text-2xl sm:text-3xl font-bold text-white">{initials}</span>
            </div>
          </div>

          {/* Name + badges */}
          <div className="pt-12 sm:pt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-zinc-900">{displayName}</h2>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {user?.company_name || 'Brand Partner'} · @{user?.username}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-2 shrink-0">
              <StatPill label="Leads"    value="1,284" accent="orange" />
              <StatPill label="Rating"   value="4.8★"  accent="amber" />
              <StatPill label="Joined"   value={memberSince} accent="blue" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column detail grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Business info */}
        <Section title="Business Details">
          <FieldRow icon={Building2} label="Brand Name"    value={user?.brand_name}    copyKey="brand"   onCopy={copy} isCopied={copied === 'brand'} />
          <FieldRow icon={Building2} label="Company Name"  value={user?.company_name}  copyKey="company" onCopy={copy} isCopied={copied === 'company'} />
          <FieldRow icon={FileText}  label="GST Number"    value={user?.gst}           copyKey="gst"     onCopy={copy} isCopied={copied === 'gst'} />
          <FieldRow icon={MapPin}    label="Office Address" value={user?.office_address} />
        </Section>

        {/* Contact info */}
        <Section title="Contact Details">
          <FieldRow icon={User}  label="Username"     value={user?.username}              copyKey="uname"  onCopy={copy} isCopied={copied === 'uname'} />
          <FieldRow icon={Mail}  label="Email"        value={user?.email}                 copyKey="email"  onCopy={copy} isCopied={copied === 'email'} />
          <FieldRow icon={Phone} label="Phone Number" value={user?.phone_no || user?.phone} copyKey="phone" onCopy={copy} isCopied={copied === 'phone'} />
        </Section>

      </div>

      {/* ── Account info strip ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 px-6 py-5">
        <h3 className="text-[13px] font-bold text-zinc-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Member Since</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account Type</p>
              <p className="text-[13px] font-semibold text-zinc-800 mt-0.5">Premium Brand Partner</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Portal Access</p>
              <p className="text-[13px] font-semibold text-emerald-600 mt-0.5">Active</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;