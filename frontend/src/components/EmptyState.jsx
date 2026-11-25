import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No courses found',
  description = 'Get started by creating your first AI-generated curriculum.',
  actionLabel = 'Create Course',
  onAction,
  icon: Icon = BookOpen,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center liquid-glass rounded-3xl">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {onAction && (
        <Button variant="primary" icon={Sparkles} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
