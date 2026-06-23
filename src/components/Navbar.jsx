import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, LogOut, Search } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.brand_name || user?.name || user?.username || 'Partner';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-[72px] bg-white/78 backdrop-blur-[20px] border-b border-surface-200/60">
      <div className="flex items-center justify-between h-full px-6 md:px-8">
        {/* Left - Hamburger (below md only) + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar - visible from md (tablet+) */}
          <div className="hidden md:flex items-center gap-2.5 bg-surface-50 border border-surface-200/60 rounded-xl px-4 py-2.5 w-72 transition-all duration-200 focus-within:border-primary-300 focus-within:bg-white focus-within:shadow-sm">
            <Search className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-surface-700 placeholder-surface-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-all duration-200">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-surface-200/80"></div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[13px] font-semibold text-surface-800 leading-tight">{displayName}</span>
              <span className="text-[11px] text-surface-400 leading-tight mt-0.5">Brand Partner</span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center ring-2 ring-white shadow-md shadow-primary-500/10">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 p-2.5 rounded-xl text-surface-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
