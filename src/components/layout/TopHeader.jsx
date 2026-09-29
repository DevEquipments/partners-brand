import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { useBrand } from "../../hooks/useBrand";

export const TopHeader = ({ onMenuToggle }) => {
  const { brandName } = useBrand();

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

      {/* Right: Theme toggle & user menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
        <UserMenu />
      </div>
    </header>
  );
};

export default TopHeader;
