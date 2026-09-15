import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBrand } from "../../hooks/useBrand";
import { usePermissions, MODULES } from "../../hooks/usePermissions";
import Avatar from "../common/Avatar";
import logo from "../../assets/logo.png";

const ALL_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    module: MODULES.DASHBOARD,
  },
  {
    label: "Customer Enquiry",
    path: "/inquiries",
    icon: MessageSquareText,
    module: MODULES.ENQUIRIES,
  },
  {
    label: "Feature Equipment Quotes",
    path: "/product-quotes",
    icon: FileText,
    module: MODULES.QUOTES,
  },
  {
    label: "Sub Admin Management",
    path: "/sub-admins",
    icon: Users,
    module: MODULES.SUBADMINS,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
    module: MODULES.PROFILE,
  },
];

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { user, role, logout } = useAuth();
  const { brandName } = useBrand();
  const { canAccessModule } = usePermissions();
  const navigate = useNavigate();

  // Filter navigation items strictly based on role and permissions
  const navItems = ALL_NAV_ITEMS.filter((item) => canAccessModule(item.module));

  const displayName = user?.name || user?.username || brandName || "Partner";
  const roleLabel = role === "ADMIN" ? "Admin" : "Sub Admin";

  const handleLogout = async () => {
    setIsMobileOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-250 ease-in-out select-none
          ${isCollapsed ? "w-16" : "w-60"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto`}
      >
        {/* Brand Header */}
        <div
          className={`flex items-center h-14 border-b border-slate-800 shrink-0 px-3.5
            ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
              <img src={logo} alt="EquipmentsDekho" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white tracking-tight uppercase truncate">
                  {brandName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">
                  Partner Operations
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 pt-2 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Operations Menu
            </div>
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
                  isCollapsed ? "justify-center px-0 py-2.5" : ""
                } ${
                  isActive
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0 transition-colors" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-2.5 border-t border-slate-800 space-y-1 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-800 mb-1.5">
              <Avatar name={displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] font-semibold text-orange-400">
                  {roleLabel}
                </p>
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Navigation</span>
              </>
            )}
          </button>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
