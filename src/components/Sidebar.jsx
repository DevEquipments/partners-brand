import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Hexagon,
  Users,
  FileText,
  MessageSquare,
  Settings,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard',    icon: LayoutDashboard },
  { label: 'Leads',     path: '/leads',         icon: Users },
  { label: 'Inquiries', path: '/inquiries',     icon: MessageSquare },
  { label: 'Quotations',path: '/quotations',    icon: FileText },
  { label: 'Profile',   path: '/profile',       icon: User },
  { label: 'Settings',  path: '/settings',      icon: Settings },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.brand_name || user?.name || user?.username || 'Partner';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-zinc-100
          flex flex-col transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? 'w-[68px]' : 'w-[240px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* ── Logo ── */}
        <div className={`flex items-center h-[64px] border-b border-zinc-100 shrink-0
          ${isCollapsed ? 'justify-center px-4' : 'justify-between px-5'}`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-zinc-900 leading-tight whitespace-nowrap">Equipments Dekho</p>
                <p className="text-[10px] text-zinc-400 font-medium leading-tight">Partner CRM</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-3 px-2">Main Menu</p>
          )}
          <div className="space-y-0.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer
                  ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r-full" />
                    )}
                    <item.icon className={`w-[17px] h-[17px] shrink-0 transition-colors
                      ${isActive ? 'text-orange-500' : 'text-zinc-400 group-hover:text-zinc-600'}`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ── Bottom ── */}
        <div className={`border-t border-zinc-100 shrink-0 ${isCollapsed ? 'p-2' : 'p-3'} space-y-0.5`}>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
            className={`hidden cursor-pointer md:flex items-center gap-3 w-full rounded-xl text-[13px] font-medium
              text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-all duration-150
              ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5'}`}
          >
            {isCollapsed
              ? <ChevronRight className="w-[17px] h-[17px]" />
              : <><ChevronLeft className="w-[17px] h-[17px]" /><span>Collapse</span></>
            }
          </button>

          {/* User chip */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-zinc-800 truncate">{displayName}</p>
                <p className="text-[10px] text-zinc-400">Brand Partner</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`flex cursor-pointer items-center gap-3 w-full rounded-xl text-[13px] font-medium
              text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150
              ${isCollapsed ? 'justify-center py-3' : 'px-3 py-2.5'}`}
          >
            <LogOut className="w-[17px] h-[17px] cursor-pointer" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;