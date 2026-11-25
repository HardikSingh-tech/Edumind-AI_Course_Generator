import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-950';

  const variants = {
    // 3D tactile obsidian glass button (light) / pearl white (dark)
    primary: 'btn-3d bg-slate-900 hover:bg-slate-950 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold focus:ring-slate-900 dark:focus:ring-slate-300 border border-slate-800 dark:border-white/60 shadow-[0_4px_14px_rgba(15,23,42,0.18)] dark:shadow-[0_4px_16px_rgba(255,255,255,0.08)]',
    
    // Pure liquid glass tactile button
    secondary: 'btn-3d liquid-glass hover:bg-white/90 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:ring-slate-400 border border-white/90 dark:border-white/10',
    
    // Clean frosted glass outline
    outline: 'btn-3d bg-white/50 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/15 focus:ring-slate-400 hover:border-slate-400 dark:hover:border-white/30',
    
    // Glass danger
    danger: 'btn-3d bg-rose-600 dark:bg-rose-950/80 hover:bg-rose-700 dark:hover:bg-rose-900/90 text-white dark:text-rose-200 border border-rose-700 dark:border-rose-500/40 shadow-rose-600/20 focus:ring-rose-500',
    
    // Subtle ghost button
    ghost: 'hover:bg-slate-200/60 dark:hover:bg-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-base px-6 py-2.5 gap-2.5 rounded-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
