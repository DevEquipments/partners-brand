import { Menu, FlaskConical } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { useBrand } from "../../hooks/useBrand";
import { useAuth } from "../../context/AuthContext";

export const TopHeader = ({ onMenuToggle }) => {
  const { brandName } = useBrand();
  const { isDummyEnabled, isDummySession, switchToDummySubAdmin, restoreAdminSession } = useAuth();

  return (
    <header className="h-14 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 select-none z-30 transition-colors">
      {/* Left: Mobile hamburger & portal title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:inline">
            Brand Partner:
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {brandName}
          </span>
        </div>
      </div>

      {/* Right: Development test tools, Theme toggle & user menu */}
      <div className="flex items-center gap-2">
        {isDummyEnabled && (
          <div className="hidden sm:flex items-center mr-1">
            {isDummySession ? (
              <button
                type="button"
                onClick={restoreAdminSession}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-500/20 transition-colors cursor-pointer"
                title="Exit dummy sub admin test session and restore real admin account"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Exit Test Sub Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={switchToDummySubAdmin}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                title="Switch session to dummy sub admin for role and permission UI testing"
              >
                <FlaskConical className="w-3.5 h-3.5 text-orange-600" />
                <span>Test Sub Admin Session</span>
              </button>
            )}
          </div>
        )}

        <ThemeToggle />
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
        <UserMenu />
      </div>
    </header>
  );
};

export default TopHeader;
