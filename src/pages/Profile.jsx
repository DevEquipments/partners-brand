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
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

const Profile = () => {
  const { user, fetchProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    if (!user) {
      fetchProfile().finally(() => setIsLoading(false));
    }
  }, [user, fetchProfile]);

  if (isLoading || loading) {
    return <Loader fullScreen={false} text="Loading profile..." />;
  }

  const displayName = user?.brand_name || user?.name || user?.username || 'Partner';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profileFields = [
    { label: 'Brand Name', value: user?.brand_name, icon: Building2 },
    { label: 'Company Name', value: user?.company_name, icon: Building2 },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Phone', value: user?.phone_no || user?.phone, icon: Phone },
    { label: 'GST Number', value: user?.gst, icon: FileText },
    { label: 'Office Address', value: user?.office_address, icon: MapPin },
    { label: 'Username', value: user?.username, icon: User },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Profile</h1>
        <p className="text-[13px] text-surface-500">View and manage your brand partner profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden">
        {/* Cover / Header */}
        <div className="relative h-44 sm:h-52 bg-gradient-to-br from-surface-900 via-primary-900 to-secondary-700 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-400/10 rounded-full blur-3xl translate-y-1/3"></div>
          </div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>

        {/* Avatar & Name */}
        <div className="relative px-6 sm:px-8 pb-8">
          {/* Avatar */}
          <div className="absolute -top-14 left-6 sm:left-8">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center ring-4 ring-white shadow-xl shadow-primary-500/10">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
          </div>

          {/* Name & Status */}
          <div className="pt-[72px] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">{displayName}</h2>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Verified</span>
                </div>
              </div>
              <p className="text-[13px] text-surface-500">
                {user?.company_name || 'Brand Partner'} | Premium Partner
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-surface-500 bg-surface-50 border border-surface-100 px-3.5 py-2 rounded-xl font-medium">
              <Shield className="w-3.5 h-3.5 text-surface-400" />
              <span>Premium Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profileFields.map((field, index) => (
          <div
            key={field.label}
            className="bg-white rounded-2xl border border-surface-200/60 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-surface-300 animate-fade-in"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <field.icon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-surface-800 break-words leading-relaxed">
                  {field.value || (
                    <span className="text-surface-300 font-normal italic">Not provided</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-surface-200/60 p-6 sm:p-8">
        <h3 className="text-base font-bold text-surface-900 tracking-tight mb-5">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-5">
            <div className="flex items-center gap-2 text-surface-400 mb-2.5">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">Member Since</span>
            </div>
            <p className="text-sm font-bold text-surface-800">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-5">
            <div className="flex items-center gap-2 text-surface-400 mb-2.5">
              <Shield className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">Account Type</span>
            </div>
            <p className="text-sm font-bold text-surface-800">Premium Brand Partner</p>
          </div>
          <div className="bg-surface-50 border border-surface-100 rounded-xl p-5">
            <div className="flex items-center gap-2 text-surface-400 mb-2.5">
              <ExternalLink className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">Portal Access</span>
            </div>
            <p className="text-sm font-bold text-emerald-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
