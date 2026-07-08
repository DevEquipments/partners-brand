import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, LogOut, ChevronLeft, ChevronRight,
  X, Hexagon, Users, FileText, MessageSquare, Settings,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  // { label: 'Leads',     path: '/leads',       icon: Users },
  { label: 'Customer Inquiries', path: '/inquiries', icon: MessageSquare },
  { label: 'Product Quotations', path: '/product-quotes', icon: FileText },
  { label: 'Profile',   path: '/profile',     icon: User },
  { label: 'Settings',  path: '/settings',    icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.brand_name || user?.name || user?.username || 'Partner';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Dark sidebar — Layer 2 in the visual hierarchy */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen bg-zinc-900 border-r border-zinc-800
        flex flex-col transition-all duration-300 ease-in-out select-none
        ${isCollapsed ? 'w-16' : 'w-56'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>

        {/* Logo */}
        <div className={`flex items-center h-15 border-b border-zinc-800 shrink-0
          ${isCollapsed ? 'justify-center px-3' : 'px-4 gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 shadow-sm">
            <Hexagon className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-white truncate">EquipmentsDekho</p>
              <p className="text-[10px] text-zinc-400 font-medium">Partner CRM</p>
            </div>
          )}
          <button onClick={() => setIsMobileOpen(false)}
            className="md:hidden ml-auto p-1 rounded-lg text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? 'px-2' : 'px-2'}`}>
          {!isCollapsed && (
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-2 px-2">Main Menu</p>
          )}
          <div className="space-y-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer
                  ${isCollapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 shrink-0 transition-colors
                      ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className={`border-t border-zinc-800 shrink-0 py-3 ${isCollapsed ? 'px-2' : 'px-2'} space-y-0.5`}>

          {/* User chip */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-800 mb-1">
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-zinc-100 truncate uppercase">{displayName}</p>
                <p className="text-[10px] text-zinc-500">Brand Partner</p>
              </div>
            </div>
          )}

          {/* Collapse — desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden md:flex items-center gap-2.5 w-full rounded-lg text-[13px] font-medium
              text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all duration-150
              ${isCollapsed ? 'justify-center py-2.5 mx-0' : 'px-3 py-2.5'}`}
          >
            {isCollapsed
              ? <ChevronRight className="w-4 h-4" />
              : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>

          {/* Logout */}
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            title="Log out"
            className={`flex items-center gap-2.5 w-full rounded-lg text-[13px] font-medium
              text-zinc-500 hover:bg-red-900/40 hover:text-red-400 transition-all duration-150
              ${isCollapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'}`}
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