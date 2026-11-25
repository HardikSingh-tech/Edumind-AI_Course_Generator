import api from './client';

export const courseApi = {
  // Get all courses (quick list)
  getAll: () => api.get('/courses'),

  // Search courses with query, audience filter, pagination, and sorting
  search: (params) => api.get('/courses/search', { params }),

  // Get specific course by ID
  getById: (id) => api.get(`/courses/${id}`),

  // Generate a new syllabus using Gemini AI
  createSyllabus: (data) => api.post('/courses/syllabus', data),

  // Generate markdown content and quiz for an individual lesson instantly
  generateSingleLesson: (lessonId) => api.post(`/courses/lessons/${lessonId}/generate`),

  // Delete a course
  delete: (id) => api.delete(`/courses/${id}`),

  // Submit quiz answers for auto-grading
  submitQuiz: (quizId, submissionData) => api.post(`/courses/quizzes/${quizId}/submit`, submissionData),

  // Get overall platform stats
  getStats: () => api.get('/courses/stats'),

  // SSE Stream URL for multi-lesson generation
  getExpansionStreamUrl: (courseId) => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    const token = localStorage.getItem('edumind_auth_token');
    return `${base}/courses/${courseId}/expand-stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  }
};
