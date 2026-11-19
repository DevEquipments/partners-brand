import { useState } from "react";
import {
  Building2,
  Image as ImageIcon,
  Award,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import { updateProfile } from "../services/profile";
import { brandProfileService } from "../services/brandProfileService";
import PageHeader from "../components/common/PageHeader";
import LoadingState from "../components/common/LoadingState";
import BrandCompanyInfo from "./profile/BrandCompanyInfo";
import BrandBanners from "./profile/BrandBanners";
import BrandAchievements from "./profile/BrandAchievements";
import BrandServices from "./profile/BrandServices";

export const Profile = () => {
  const { user, fetchProfile, loading: authLoading, role } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = role === "ADMIN";
  const canEdit = hasPermission(PERMISSIONS.PROFILE_EDIT) || isAdmin;

  // Active Profile Tab for Admin
  const [activeTab, setActiveTab] = useState("company"); // "company" | "banners" | "achievements" | "services"

  // Local Brand Profile State initialized with user overrides
  const [companyInfo, setCompanyInfo] = useState(() => {
    const base = brandProfileService.getCompanyInfo();
    if (user && role === "ADMIN") {
      return {
        ...base,
        brand_name: user.brand_name || base.brand_name,
        company_name: user.company_name || base.company_name,
        brand_id: user.brand_id || base.brand_id,
        gst: user.gst || base.gst,
        email: user.email || base.email,
        phone: user.phone_no || user.phone || base.phone,
        office_address: user.office_address || base.office_address,
      };
    }
    return base;
  });

  const [banners, setBanners] = useState(() => brandProfileService.getBanners());
  const [achievements, setAchievements] = useState(() =>
    brandProfileService.getAchievements()
  );
  const [services, setServices] = useState(() =>
    brandProfileService.getServices()
  );

  // Handlers for Brand Profile Updates
  const handleUpdateCompanyInfo = async (updated) => {
    const saved = brandProfileService.updateCompanyInfo(updated);
    setCompanyInfo(saved);

    // Also dispatch to API if endpoint is available
    try {
      await updateProfile(updated);
      if (fetchProfile) fetchProfile();
    } catch {
      // Offline / pending endpoint tolerance
    }
  };

  const handleAddBanner = (newBanner) => {
    brandProfileService.addBanner(newBanner);
    setBanners(brandProfileService.getBanners());
  };

  const handleToggleBanner = (id) => {
    brandProfileService.toggleBannerStatus(id);
    setBanners(brandProfileService.getBanners());
  };

  const handleDeleteBanner = (id) => {
    brandProfileService.deleteBanner(id);
    setBanners(brandProfileService.getBanners());
  };

  const handleAddAchievement = (newAch) => {
    brandProfileService.addAchievement(newAch);
    setAchievements(brandProfileService.getAchievements());
  };

  const handleDeleteAchievement = (id) => {
    brandProfileService.deleteAchievement(id);
    setAchievements(brandProfileService.getAchievements());
  };

  const handleAddService = (newSrv) => {
    brandProfileService.addService(newSrv);
    setServices(brandProfileService.getServices());
  };

  const handleToggleService = (id) => {
    brandProfileService.toggleServiceStatus(id);
    setServices(brandProfileService.getServices());
  };

  const handleDeleteService = (id) => {
    brandProfileService.deleteService(id);
    setServices(brandProfileService.getServices());
  };

  if (authLoading && !user) {
    return (
      <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <LoadingState text="Loading profile credentials..." />
      </div>
    );
  }

  // =========================================================================
  // SUB-ADMIN VIEW: Strictly read-only personal profile.
  // Banners, Achievements, Services, and Company Info editing are hidden.
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Operator Profile"
          subtitle="View your assigned Sub-Admin operator credentials and regional access"
          breadcrumbs={[{ label: "Account" }, { label: "My Profile" }]}
        />

        {/* Notice Banner */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Sub-Admin Account Access
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Brand profile configurations, showcase banners, awards, and commercial services are managed exclusively by the Primary Brand Administrator.
            </p>
          </div>
        </div>

        {/* Sub-Admin Operator Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xl flex items-center justify-center shrink-0 border border-orange-500/20">
              {user?.username?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  @{user?.username}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Role: Sub Admin
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ID: #{user?.id || "—"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.company_name || "Regional Partner Operator"} • Brand: {user?.brand_name || "JCB"}
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Assigned Account Details
            </h4>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 w-1/3 bg-slate-50/30 dark:bg-slate-800/30">
                  Official Email
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                  {user?.email || "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50/30 dark:bg-slate-800/30">
                  Contact Phone
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                  {user?.phone_no || user?.phone || "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50/30 dark:bg-slate-800/30">
                  Branch Office Address
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                  {user?.office_address || "—"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50/30 dark:bg-slate-800/30">
                  GST Registration
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                  {user?.gst || "Not provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN VIEW: Full Enterprise Brand Profile with 4 rich tabs.
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Brand Profile & Digital Showroom"
        subtitle="Manage brand identity, marketing banners, certified achievements, and equipment services"
        breadcrumbs={[{ label: "Administration" }, { label: "Brand Profile" }]}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-0.5 overflow-x-auto">
        {[
          { key: "company", label: "Company Info", icon: Building2 },
          { key: "banners", label: "Showcase Banners", icon: ImageIcon, count: banners.length },
          { key: "achievements", label: "Achievements & Awards", icon: Award, count: achievements.length },
          { key: "services", label: "Equipment Services", icon: Wrench, count: services.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "border-orange-600 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "company" && (
        <BrandCompanyInfo
          companyInfo={companyInfo}
          onUpdateCompanyInfo={handleUpdateCompanyInfo}
          canEdit={canEdit}
        />
      )}

      {activeTab === "banners" && (
        <BrandBanners
          banners={banners}
          onAddBanner={handleAddBanner}
          onToggleStatus={handleToggleBanner}
          onDeleteBanner={handleDeleteBanner}
          canEdit={canEdit}
        />
      )}

      {activeTab === "achievements" && (
        <BrandAchievements
          achievements={achievements}
          onAddAchievement={handleAddAchievement}
          onDeleteAchievement={handleDeleteAchievement}
          canEdit={canEdit}
        />
      )}

      {activeTab === "services" && (
        <BrandServices
          services={services}
          onAddService={handleAddService}
          onToggleStatus={handleToggleService}
          onDeleteService={handleDeleteService}
          canEdit={canEdit}
        />
      )}
    </div>
  );
};

export default Profile;
