import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
  Edit3,
  KeyRound,
  Trash2,
} from "lucide-react";
import Button from "../../components/common/Button";
import { normalizeSubAdminStatus } from "../../utils/subAdminStatus";

export const SubAdminDetail = ({
  subAdmin,
  _subAdminId,
  onBack,
  onManageAccess,
  onToggleStatus,
  isUpdatingStatus = false,
  onEdit,
  onDelete,
  onUpdatePassword,
}) => {
  const navigate = useNavigate();
  const member = subAdmin;
  const statusInfo = normalizeSubAdminStatus(member?.status, member?.status_text);

  const [activeTab, setActiveTab] = useState("overview");

  if (!member) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-500">Sub Admin not found.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Return to Sub Admins list
        </Button>
      </div>
    );
  }

  const handleManageAccess = () => {
    if (onManageAccess) {
      onManageAccess(member);
    } else {
      navigate(`/sub-admins?subAdminId=${member.id}&view=access`);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Back to Sub Admins
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(member)}
              icon={Edit3}
            >
              Edit
            </Button>
          )}

          {onUpdatePassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdatePassword(member)}
              icon={KeyRound}
            >
              Password
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleManageAccess}
            icon={ShieldCheck}
          >
            Manage Access
          </Button>

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(member)}
              icon={Trash2}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Operator Header Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold text-xl flex items-center justify-center border border-orange-500/20 shrink-0">
              {member.username?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  @{member.username}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ID: #{member.id}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Role: Sub Admin
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 ${statusInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                  <span>{statusInfo.text}</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {member.email || "No email"} • {member.phone_no || member.phone || "No phone configured"} • {member.company_name || "Company not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-0.5">
        {[
          { key: "overview", label: "Overview", icon: User },
          { key: "company", label: "Company & Office", icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "border-orange-600 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Operator Credentials & Account Information
            </h3>
            <button
              type="button"
              onClick={handleManageAccess}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Manage Access</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50/30 dark:bg-slate-800/30">
                  Sub Admin ID
                </td>
                <td className="px-4 py-3 font-mono text-slate-900 dark:text-white font-bold">
                  #{member.id}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Username (Login)
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  @{member.username}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Official Email
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                  {member.email || "Not specified"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Contact Phone
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                  {member.phone_no || member.phone || "Not specified"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Associated Brand
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                  {member.brand_name || "N/A"} {member.brand_id ? `(${member.brand_id})` : ""}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  System Role
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                  Sub Admin (Brand Regional Operator)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Account Status
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusInfo.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                      <span>{statusInfo.text}</span>
                    </span>
                    {onToggleStatus && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUpdatingStatus || statusInfo.isActive === null}
                        onClick={() => onToggleStatus(member)}
                        isLoading={isUpdatingStatus}
                      >
                        {statusInfo.isActive ? "Deactivate Account" : "Activate Account"}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: COMPANY & OFFICE */}
      {activeTab === "company" && (
        <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Company & Physical Office Details
            </h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50/30 dark:bg-slate-800/30">
                  Company Name
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  {member.company_name || "Not specified"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  Office Address
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200">
                  {member.office_address || "Not specified"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/30">
                  GST Registration
                </td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                  {member.gst || "Not provided"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubAdminDetail;
