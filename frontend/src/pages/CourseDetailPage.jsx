import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Award,
  Zap,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { courseApi } from '../api/courses';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { Modal } from '../components/Modal';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  // Single Lesson Generating State
  const [singleLessonLoading, setSingleLessonLoading] = useState(false);

  // SSE Expansion Streaming State
  const [isExpanding, setIsExpanding] = useState(false);
  const [sseLogs, setSseLogs] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const fetchCourse = async (preserveActiveLessonId = null) => {
    try {
      const res = await courseApi.getById(id);
      if (res.success) {
        setCourse(res.data);
        
        if (preserveActiveLessonId) {
          for (const m of res.data.modules || []) {
            const found = m.lessons?.find((l) => l.id === preserveActiveLessonId);
            if (found) {
              setActiveLesson(found);
              return;
            }
          }
        }
        
        if (!activeLesson && res.data?.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(res.data.modules[0].lessons[0]);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleGenerateSingleLesson = async (lessonId) => {
    if (singleLessonLoading) return;
    try {
      setSingleLessonLoading(true);
      addToast('Synthesizing lesson material & quiz...', 'info');
      const res = await courseApi.generateSingleLesson(lessonId);
      if (res.success) {
        addToast('Lesson content & quiz generated successfully!', 'success');
        setActiveLesson(res.data);
        await fetchCourse(lessonId);
      }
    } catch (err) {
      addToast(err.message || 'Failed to generate lesson content', 'error');
    } finally {
      setSingleLessonLoading(false);
    }
  };

  const handleExpandCourse = () => {
    if (isExpanding) return;

    setIsExpanding(true);
    setSseLogs(['Connecting to Course Expansion stream...']);
    setShowLogModal(true);

    const streamUrl = courseApi.getExpansionStreamUrl(id);
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      setSseLogs((prev) => [...prev, event.data]);
      if (event.data.includes('fully completed')) {
        addToast('Course content generated successfully!', 'success');
        eventSource.close();
        setIsExpanding(false);
        fetchCourse(activeLesson?.id);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setSseLogs((prev) => [...prev, 'Notice: Stream updated.']);
      eventSource.close();
      setIsExpanding(false);
      fetchCourse(activeLesson?.id);
    };
  };

  const handleOpenQuiz = (quiz, lessonTitle) => {
    setActiveQuiz({ ...quiz, lessonTitle });
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const handleAnswerSelect = (questionId, optionId) => {
    if (quizResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setQuizSubmitting(true);
      const res = await courseApi.submitQuiz(activeQuiz.id, {
        selectedOptionIds: selectedAnswers,
      });

      if (res.success) {
        setQuizResult(res.data);
        if (res.data.passed) {
          addToast(`Congratulations! You passed with ${res.data.scorePercentage.toFixed(0)}%!`, 'success');
        } else {
          addToast(`Score: ${res.data.scorePercentage.toFixed(0)}%. Passing score is ${res.data.passingScore}%. Try again!`, 'error');
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit quiz', 'error');
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (loading) return <Loader message="Opening curriculum reader..." size="lg" />;
  if (!course) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="p-6 rounded-2xl liquid-glass flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/90 dark:border-white/10">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/courses')}
          >
            Catalog
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                {course.targetAudience}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{course.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            isLoading={isExpanding}
            onClick={handleExpandCourse}
          >
            {isExpanding ? 'Synthesizing...' : 'Expand All with AI'}
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Outline Navigator */}
        <div className="lg:col-span-4 liquid-glass rounded-2xl p-4 space-y-4 max-h-[calc(100vh-190px)] overflow-y-auto border border-white/90">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Curriculum Outline
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {course.modules?.length || 0} modules
            </span>
          </div>

          <div className="space-y-3">
            {course.modules?.map((mod, modIdx) => (
              <div key={mod.id || modIdx} className="space-y-1">
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="truncate">M{mod.orderIndex || modIdx + 1}: {mod.title}</span>
                </div>
                <div className="space-y-1 pl-1.5">
                  {mod.lessons?.map((les, lesIdx) => {
                    const isSelected = activeLesson?.id === les.id;
                    const hasContent = !!les.contentMarkdown;
                    const hasQuiz = !!les.quiz;

                    return (
                      <button
                        key={les.id || lesIdx}
                        onClick={() => setActiveLesson(les)}
                        className={`btn-3d w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white font-semibold border-slate-900 shadow-md'
                            : 'bg-white/60 hover:bg-white text-slate-700 border-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{les.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {hasContent ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Content Ready" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Pending generation" />
                          )}
                          {hasQuiz && (
                            <HelpCircle className="w-3 h-3 text-amber-500" title="Quiz Available" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area: Reader & Quizzes */}
        <div className="lg:col-span-8 liquid-glass rounded-2xl p-6 lg:p-8 space-y-6 min-h-[500px] border border-white/90">
          {activeLesson ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                    Lesson {activeLesson.orderIndex}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{activeLesson.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={activeLesson.contentMarkdown ? "outline" : "primary"}
                    size="sm"
                    icon={Zap}
                    isLoading={singleLessonLoading}
                    onClick={() => handleGenerateSingleLesson(activeLesson.id)}
                  >
                    {activeLesson.contentMarkdown ? 'Regenerate Content' : 'Generate This Lesson'}
                  </Button>

                  {activeLesson.quiz && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={HelpCircle}
                      onClick={() => handleOpenQuiz(activeLesson.quiz, activeLesson.title)}
                    >
                      Quiz ({activeLesson.quiz.questions?.length || 0} Qs)
                    </Button>
                  )}
                </div>
              </div>

              {/* Lesson Body */}
              {activeLesson.contentMarkdown ? (
                <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-800 prose-headings:text-slate-900 prose-p:text-slate-700 text-sm leading-relaxed space-y-4">
                  <ReactMarkdown>{activeLesson.contentMarkdown}</ReactMarkdown>
                </div>
              ) : (
                <div className="p-12 rounded-2xl liquid-glass-subtle text-center space-y-4 my-6 border border-white/80">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-700 shadow-sm">
                    <Zap className="w-6 h-6 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Lesson Content Not Yet Generated</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Click below to generate complete markdown learning notes, architectural breakdowns, code examples, and an assessment quiz.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      icon={Sparkles}
                      onClick={() => handleGenerateSingleLesson(activeLesson.id)}
                      isLoading={singleLessonLoading}
                    >
                      Generate This Lesson Instantly
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      icon={Layers}
                      onClick={handleExpandCourse}
                      isLoading={isExpanding}
                    >
                      Expand Entire Course
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a lesson from the curriculum outline to view content.
            </div>
          )}
        </div>
      </div>

      {/* Expansion SSE Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Curriculum Expansion Stream"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Real-time streaming generation of comprehensive Markdown lesson notes and quizzes:
          </p>
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 shadow-inner">
            {sseLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-500 select-none">&gt;</span>
                <span className={log.includes('completed') ? 'text-emerald-400 font-bold' : ''}>
                  {log}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLogModal(false)}
            >
              {isExpanding ? 'Minimize' : 'Close'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quiz Modal */}
      {activeQuiz && (
        <Modal
          isOpen={!!activeQuiz}
          onClose={() => setActiveQuiz(null)}
          title={`Quiz: ${activeQuiz.lessonTitle}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3 font-mono">
              <span>Required Score: {activeQuiz.passingScore}%</span>
              {quizResult && (
                <span className={`font-bold ${quizResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Result: {quizResult.scorePercentage.toFixed(0)}% ({quizResult.correctAnswers}/{quizResult.totalQuestions}) - {quizResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              )}
            </div>

            <div className="space-y-6">
              {activeQuiz.questions?.map((q, qIndex) => {
                const feedback = quizResult?.feedback?.[q.id];

                return (
                  <div key={q.id || qIndex} className="p-4 rounded-xl liquid-glass-subtle space-y-3 border border-slate-200/80">
                    <p className="text-sm font-semibold text-slate-900">
                      {qIndex + 1}. {q.questionText}
                    </p>

                    <div className="space-y-2">
                      {q.options?.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.id;
                        let optStyle = 'border-slate-200 text-slate-700 bg-white/70 hover:bg-white';

                        if (feedback) {
                          if (opt.id === feedback.correctOptionId) {
                            optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium shadow-sm';
                          } else if (isSelected && !feedback.isCorrect) {
                            optStyle = 'border-rose-500 bg-rose-50 text-rose-800';
                          }
                        } else if (isSelected) {
                          optStyle = 'border-slate-900 bg-slate-900 text-white font-semibold shadow-sm';
                        }

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleAnswerSelect(q.id, opt.id)}
                            className={`btn-3d p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt.optionText}</span>
                            {feedback && opt.id === feedback.correctOptionId && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {feedback && feedback.explanation && (
                      <div className="pt-2 text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-900">Explanation: </span>
                        {feedback.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveQuiz(null)}
              >
                Close
              </Button>
              {!quizResult ? (
                <Button
                  variant="primary"
                  size="md"
                  icon={Award}
                  isLoading={quizSubmitting}
                  onClick={handleSubmitQuiz}
                >
                  Submit for Evaluation
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setQuizResult(null);
                    setSelectedAnswers({});
                  }}
                >
                  Retry Quiz
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
