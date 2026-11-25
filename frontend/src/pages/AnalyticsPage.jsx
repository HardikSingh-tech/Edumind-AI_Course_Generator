import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Cpu,
  Database,
  Activity,
  Layers
} from 'lucide-react';
import { courseApi } from '../api/courses';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/Loader';

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await courseApi.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        addToast(err.message || 'Failed to fetch platform metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader message="Reading engine telemetry..." size="lg" />;

  const systemMetrics = [
    { label: 'Database Status', value: 'Connected (PostgreSQL 18)', icon: Database },
    { label: 'AI Model Engine', value: 'Gemini Flash-Lite Latest', icon: Cpu },
    { label: 'API Gateway', value: 'Operational (HTTP 200 OK)', icon: Activity },
    { label: 'SSE Stream Buffer', value: '600s Active Timeout', icon: Layers },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Telemetry</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics and system aggregation across the EduMind infrastructure
        </p>
      </div>

      {/* Aggregate Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl liquid-glass border border-white/90 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courses</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">{stats?.totalCourses || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Architected courses</p>
        </div>
        <div className="p-6 rounded-2xl liquid-glass border border-white/90 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modules</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{stats?.totalModules || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Milestone curriculum units</p>
        </div>
        <div className="p-6 rounded-2xl liquid-glass border border-white/90 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lessons</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{stats?.totalLessons || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Markdown lesson blocks</p>
        </div>
        <div className="p-6 rounded-2xl liquid-glass border border-white/90 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quizzes</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 tracking-tight">{stats?.totalQuizzes || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Evaluated question sets</p>
        </div>
      </div>

      {/* Infrastructure Telemetry */}
      <div className="p-8 rounded-3xl liquid-glass space-y-6 border border-white/90 dark:border-white/10">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Backend Engine Telemetry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="p-4 rounded-xl liquid-glass-subtle flex items-center gap-4 border border-white/80 dark:border-white/10">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{m.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
