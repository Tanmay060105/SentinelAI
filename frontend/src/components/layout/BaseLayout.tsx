import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Map, 
  List, 
  BarChart2,
  RadioTower, 
  Settings, 
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { useAlerts } from '../../context/AlertsContext';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Live Map', href: '/app/map', icon: Map },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart2 },
  { name: 'Sources', href: '/app/sources', icon: RadioTower },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export function BaseLayout() {
  const { user, logout } = useAuth();
  const { unreadCount, clearUnread } = useAlerts();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30 overflow-hidden shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <img src="/logo.jpg" alt="Logo" className="w-6 h-6 object-cover rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-white">Sentinel</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">AI</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Notifications */}
        <div className="px-4 py-2">
          <button 
            onClick={clearUnread}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3 text-slate-300 group-hover:text-slate-100 transition-colors">
              <div className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse" />
                )}
              </div>
              <span className="text-sm font-medium">Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-800/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900 to-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
