import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Layers, 
  FileText, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { courseApi } from '../api/courses';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseApi.search({
        query: searchQuery || undefined,
        audience: audienceFilter || undefined,
        page,
        size: 9,
        sortBy,
        sortDir
      });

      if (res.success) {
        setCourses(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, sortBy, sortDir]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCourses();
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete course "${title}"? This will delete all modules, lessons, and quizzes.`)) return;

    try {
      await courseApi.delete(id);
      addToast(`Course "${title}" deleted`, 'success');
      fetchCourses();
    } catch (err) {
      addToast(err.message || 'Failed to delete course', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Curriculum Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Browse and inspect all {totalElements} synthesized AI courses
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/studio')}
        >
          New Course
        </Button>
      </div>

      {/* Filter and Search Bar - Liquid Glass */}
      <div className="p-4 rounded-2xl liquid-glass flex flex-col md:flex-row items-center gap-4 border border-white/90 dark:border-white/10">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <Input
            placeholder="Filter courses by topic or keywords..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={audienceFilter}
            onChange={(e) => {
              setAudienceFilter(e.target.value);
              setPage(0);
            }}
            className="liquid-input text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="" className="dark:bg-slate-900">All Audiences</option>
            <option value="Junior Developers" className="dark:bg-slate-900">Junior Developers</option>
            <option value="Beginners" className="dark:bg-slate-900">Beginners</option>
            <option value="Intermediate" className="dark:bg-slate-900">Intermediate</option>
            <option value="Advanced Engineers" className="dark:bg-slate-900">Advanced Engineers</option>
          </select>

          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split('-');
              setSortBy(sb);
              setSortDir(sd);
            }}
            className="liquid-input text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="createdAt-desc" className="dark:bg-slate-900">Newest</option>
            <option value="createdAt-asc" className="dark:bg-slate-900">Oldest</option>
            <option value="title-asc" className="dark:bg-slate-900">Title (A-Z)</option>
            <option value="title-desc" className="dark:bg-slate-900">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <Loader message="Fetching catalog..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses matched your query"
          description="Adjust your search keyword or audience filter, or engineer a new course."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setAudienceFilter('');
            setPage(0);
            fetchCourses();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="group p-6 rounded-2xl liquid-glass liquid-glass-interactive cursor-pointer flex flex-col justify-between border border-white/90 dark:border-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
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
                  Explore <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs font-mono text-slate-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
