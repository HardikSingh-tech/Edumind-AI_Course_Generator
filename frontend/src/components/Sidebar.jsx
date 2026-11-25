import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  BarChart3, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'All Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Studio', path: '/studio', icon: Sparkles },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0c101a]/90 backdrop-blur-2xl flex flex-col shrink-0 h-screen lg:sticky lg:top-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/[0.08] border border-slate-800 dark:border-white/20 flex items-center justify-center shadow-md text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                EduMind <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">AI</span>
              </h1>
              <p className="text-[10px] font-medium tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Curriculum Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 lg:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
            Workspace
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white/10 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)] border border-slate-800 dark:border-white/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/15 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{user?.name || 'Instructor'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'instructor@edumind.ai'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
