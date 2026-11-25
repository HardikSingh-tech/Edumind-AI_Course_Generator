import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { courseApi } from '../api/courses';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';

export const StudioPage = () => {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('Junior Developers');
  const [loading, setLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      addToast('Please enter a course topic', 'error');
      return;
    }

    try {
      setLoading(true);
      addToast('Generating structured curriculum with Gemini AI...', 'info');
      const res = await courseApi.createSyllabus({ topic, targetAudience });
      if (res.success) {
        setGeneratedCourse(res.data);
        addToast('Curriculum syllabus generated and saved successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Generation failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sampleTopics = [
    { title: 'Docker for Beginners', audience: 'Junior Developers' },
    { title: 'Fullstack Microservices with Spring Boot & Kafka', audience: 'Advanced Engineers' },
    { title: 'Modern React 19 & Tailwind CSS Masterclass', audience: 'Intermediate' },
    { title: 'System Design: Scaling to 10M Users', audience: 'Senior Architects' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" /> Direct Engine Generation
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Course Studio
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Specify a technology or topic. The autonomous engine structures a multi-module syllabus with lesson plans and objective breakdowns.
        </p>
      </div>

      {/* Generator Card - Liquid Glass */}
      <div className="p-8 md:p-10 rounded-3xl liquid-glass relative overflow-hidden border border-white/90 dark:border-white/10">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Topic or Technology
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Consensus Algorithms, Cloud Native Kubernetes..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="w-full liquid-input rounded-2xl px-4 py-3.5 text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Target Audience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Beginners', 'Junior Developers', 'Intermediate', 'Advanced Engineers'].map((aud) => {
                const active = targetAudience === aud;
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setTargetAudience(aud)}
                    className={`btn-3d py-2.5 px-3 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold border-slate-900 dark:border-white shadow-sm'
                        : 'bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {aud}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Templates:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(sample.title);
                    setTargetAudience(sample.audience);
                  }}
                  className="btn-3d text-xs px-3 py-1.5 rounded-lg bg-white/70 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-sm md:text-base py-3"
            isLoading={loading}
            icon={Sparkles}
          >
            {loading ? 'Synthesizing Curriculum...' : 'Generate Syllabus'}
          </Button>
        </form>
      </div>

      {/* Generated Result Preview */}
      {generatedCourse && (
        <div className="p-8 rounded-3xl liquid-glass space-y-6 animate-fade-in border border-white/90">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                Ready & Saved
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{generatedCourse.title}</h2>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{generatedCourse.description}</p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => navigate(`/courses/${generatedCourse.id}`)}
            >
              Open Workspace
            </Button>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200/80">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Generated Modules ({generatedCourse.modules?.length || 0})
            </h3>
            <div className="space-y-2">
              {generatedCourse.modules?.map((module, i) => (
                <div
                  key={module.id || i}
                  className="p-4 rounded-xl liquid-glass-subtle flex items-center justify-between border border-white/90"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900">
                      Module {module.orderIndex || i + 1}: {module.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{module.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-3">
                    {module.lessons?.length || 0} lessons
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
