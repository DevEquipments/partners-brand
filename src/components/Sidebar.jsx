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
  Sparkles,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile / Small tablet Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar - visible from md (tablet 768px+) */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-surface-200/80
          flex flex-col transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* ---- Logo / Brand Section ---- */}
        <div className={`flex items-center h-[72px] border-b border-surface-100 ${isCollapsed ? 'px-4 justify-center' : 'px-6 justify-between'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
              <Hexagon className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-[15px] font-bold text-surface-900 leading-tight tracking-tight">EquipmentsDekho</h1>
                <p className="text-[11px] text-surface-400 font-medium leading-tight">Partner Portal</p>
              </div>
            )}
          </div>

          {/* Mobile Close - only below md */}
          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ---- Navigation ---- */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-3 py-6' : 'px-4 py-6'}`}>
          {!isCollapsed && (
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest mb-4 px-3">
              Menu
            </p>
          )}
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
                  ${
                    isActive
                      ? 'bg-primary-50/80 text-primary-700'
                      : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-600 rounded-r-full" />
                    )}
                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'group-hover:text-surface-700'}`} />
                    {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* ---- Bottom Section ---- */}
        <div className={`border-t border-surface-100 ${isCollapsed ? 'p-3' : 'p-5'} space-y-3`}>
          {/* Upgrade / Pro card - only when expanded */}
          {!isCollapsed && (
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl p-4 mb-3 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <span className="text-xs font-semibold text-white">Premium Partner</span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                You have access to all premium features and priority support.
              </p>
            </div>
          )}

          {/* Collapse Toggle - visible from md (tablet+) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex items-center gap-3 w-full rounded-xl text-[13px] font-medium
              text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-all duration-200
              ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full rounded-xl text-[13px] font-medium
              text-surface-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200
              ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
