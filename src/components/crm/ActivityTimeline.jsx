import {
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Clock,
  ArrowRightCircle,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_CONFIG } from "../../config/activityTypes";
import { formatDate } from "../../utils/dateUtils";

const ICON_MAP = {
  [ACTIVITY_TYPES.CALL]: Phone,
  [ACTIVITY_TYPES.WHATSAPP]: MessageCircle,
  [ACTIVITY_TYPES.EMAIL]: Mail,
  [ACTIVITY_TYPES.MEETING]: Calendar,
  [ACTIVITY_TYPES.SITE_VISIT]: MapPin,
  [ACTIVITY_TYPES.NOTE]: FileText,
  [ACTIVITY_TYPES.FOLLOW_UP]: Clock,
  [ACTIVITY_TYPES.STATUS_CHANGE]: ArrowRightCircle,
  [ACTIVITY_TYPES.ASSIGNMENT]: UserCheck,
  [ACTIVITY_TYPES.QUOTATION]: FileCheck,
};

export const ActivityTimeline = ({ activities = [], emptyMessage = "No activities recorded yet." }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {activities.map((activity) => {
        const IconComponent = ICON_MAP[activity.type] || FileText;
        const config = ACTIVITY_TYPE_CONFIG[activity.type] || {
          label: "Activity",
          badgeClass: "bg-slate-500/10 text-slate-600 border-slate-200",
        };

        return (
          <div key={activity.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-xs">
              <IconComponent className="w-2.5 h-2.5" />
            </div>

            {/* Timeline content card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3 text-xs space-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${config.badgeClass}`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(activity.created_at)}
                </span>
              </div>

              {activity.summary && (
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {activity.summary}
                </p>
              )}

              {activity.details && (
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {activity.details}
                </p>
              )}

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>By {activity.author_name || "System"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
