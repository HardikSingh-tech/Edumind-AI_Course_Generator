import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Trash2, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { courseApi } from '../api/courses';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        courseApi.getStats(),
        courseApi.search({ page: 0, size: 6, sortBy: 'createdAt', sortDir: 'desc' })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (coursesRes.success) setRecentCourses(coursesRes.data.content || []);
    } catch (err) {
      addToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await courseApi.delete(id);
      addToast(`Course "${title}" deleted`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to delete course', 'error');
    }
  };

  if (loading) return <Loader message="Rendering tactile workspace..." size="lg" />;

  const statCards = [
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen },
    { label: 'Modules', value: stats?.totalModules || 0, icon: Layers },
    { label: 'Lesson Blocks', value: stats?.totalLessons || 0, icon: FileText },
    { label: 'Interactive Quizzes', value: stats?.totalQuizzes || 0, icon: HelpCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Minimalist Hero Header with Light/Dark Liquid Glass Panel */}
      <div className="relative p-8 md:p-10 rounded-3xl liquid-glass overflow-hidden border border-white/90 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
              <span>Autonomous Curriculum Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Curriculum Architecture
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
              Generate structured, multi-module tech courses with deep markdown documentation and interactive assessments using a clean, liquid glass design system.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={Sparkles}
              onClick={() => navigate('/studio')}
            >
              Generate Course
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={Compass}
              onClick={() => navigate('/courses')}
            >
              Catalog
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards - Liquid Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl liquid-glass liquid-glass-interactive flex items-center justify-between border border-white/90 dark:border-white/10"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{c.value}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-inner">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Published Curriculums</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recently engineered syllabi and materials</p>
          </div>
          <Link
            to="/courses"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <EmptyState
            title="No courses created yet"
            description="Leverage the AI Curriculum Studio to architect your first syllabus in seconds."
            actionLabel="Design Syllabus"
            onAction={() => navigate('/studio')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="group p-6 rounded-2xl liquid-glass liquid-glass-interactive cursor-pointer flex flex-col justify-between border border-white/90 dark:border-white/10"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 tracking-wide">
                      {course.targetAudience || 'General'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(course.id, course.title, e)}
                      title="Delete Course"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-black dark:group-hover:text-slate-100 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {course.modules?.length || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
                    </span>
                  </div>
                  <span className="text-slate-800 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white font-semibold flex items-center gap-1">
                    Inspect <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
