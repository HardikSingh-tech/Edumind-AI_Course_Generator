import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon, Menu } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';

export const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-[#0c101a]/60 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="btn-3d p-2 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 lg:hidden cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span className="hidden xs:inline sm:inline">Engine Connected</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle theme"
          className="btn-3d p-2 rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <Button
          variant="primary"
          size="sm"
          icon={Sparkles}
          onClick={() => navigate('/studio')}
        >
          <span className="hidden sm:inline">Studio Generator</span>
          <span className="sm:hidden">Studio</span>
        </Button>
      </div>
    </header>
  );
};
