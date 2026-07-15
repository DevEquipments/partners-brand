import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Bell, LogOut, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName =
    user?.brand_name || user?.name || user?.username || "Partner";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    // White navbar — clean contrast against dark sidebar and gray page
    <header className="h-15 bg-white border-b border-slate-200 shrink-0 flex items-center px-5 md:px-6 gap-4 z-30">
      {/* Hamburger — mobile */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div
        className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-60
        focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search anything…"
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
        />
      </div>

      <div className="flex-1" />

      {/* Notification */}
      <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <Bell className="w-4.5 h-4.5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
      </button>

      <div className="w-px h-6 bg-slate-200" />

      {/* User */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[13px] font-semibold text-slate-800 leading-tight">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Brand Partner
          </span>
        </div>

        <Link to="/profile" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-bold text-white">{initials}</span>
          </div>
        </Link>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4.25 h-4.25" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
