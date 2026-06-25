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
    <header className="sticky top-0 z-30 h-[64px] bg-white/90 backdrop-blur-xl border-b border-zinc-100 shrink-0">
      <div className="flex items-center justify-between h-full px-5 md:px-6 gap-4">

        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 w-64
            transition-all duration-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-orange-100">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search leads, quotes…"
              className="bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
          </button>

          <div className="w-px h-6 bg-zinc-100 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className="text-[13px] font-semibold text-zinc-800">{displayName}</span>
              <span className="text-[10px] text-zinc-400 font-medium">Brand Partner</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center ring-2 ring-white shadow-sm shadow-orange-500/20 shrink-0">
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Log out"
              className="hidden md:flex p-2 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-[17px] h-[17px]" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;