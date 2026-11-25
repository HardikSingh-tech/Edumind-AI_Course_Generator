import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 className={`${sizes[size]} animate-spin text-slate-800 dark:text-slate-200`} />
      {message && <p className="text-xs font-medium animate-pulse">{message}</p>}
    </div>
  );
};
