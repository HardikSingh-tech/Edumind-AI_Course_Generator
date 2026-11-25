package com.edumind.backend.service;

import com.edumind.backend.dto.PlatformStatsResponse;
import com.edumind.backend.dto.QuizEvaluationResult;
import com.edumind.backend.dto.QuizSubmissionRequest;
import com.edumind.backend.entity.Course;
import com.edumind.backend.entity.Option;
import com.edumind.backend.entity.Question;
import com.edumind.backend.entity.Quiz;
import com.edumind.backend.exception.ResourceNotFoundException;
import com.edumind.backend.repository.CourseRepository;
import com.edumind.backend.repository.LessonRepository;
import com.edumind.backend.repository.ModuleRepository;
import com.edumind.backend.repository.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final QuizRepository quizRepository;

    public CourseService(CourseRepository courseRepository,
                         ModuleRepository moduleRepository,
                         LessonRepository lessonRepository,
                         QuizRepository quizRepository) {
        this.courseRepository = courseRepository;
        this.moduleRepository = moduleRepository;
        this.lessonRepository = lessonRepository;
        this.quizRepository = quizRepository;
    }

    private static final java.util.Set<String> ALLOWED_SORT_FIELDS = java.util.Set.of("createdAt", "title", "id");

    @Transactional(readOnly = true)
    public Page<Course> getCoursesPaged(String query, String audience, int page, int size, String sortBy, String sortDir) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(safeSortBy).ascending() : Sort.by(safeSortBy).descending();
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);
        
        String queryParam = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String audienceParam = (audience != null && !audience.trim().isEmpty()) ? audience.trim() : null;
        
        return courseRepository.searchCourses(queryParam, audienceParam, pageable);
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

    @Transactional(readOnly = true)
    public QuizEvaluationResult evaluateQuiz(Long quizId, QuizSubmissionRequest submission) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        Map<Long, Long> selectedOptions = submission != null && submission.selectedOptionIds() != null 
                ? submission.selectedOptionIds() 
                : Map.of();

        int totalQuestions = quiz.getQuestions().size();
        int correctCount = 0;
        Map<Long, QuizEvaluationResult.QuestionFeedback> feedbackMap = new HashMap<>();

        for (Question question : quiz.getQuestions()) {
            Long selectedOptionId = selectedOptions.get(question.getId());
            Long correctOptionId = null;

            for (Option option : question.getOptions()) {
                if (option.isCorrect()) {
                    correctOptionId = option.getId();
                    break;
                }
            }

            boolean isCorrect = selectedOptionId != null && selectedOptionId.equals(correctOptionId);
            if (isCorrect) {
                correctCount++;
            }

            feedbackMap.put(question.getId(), new QuizEvaluationResult.QuestionFeedback(
                    selectedOptionId,
                    correctOptionId,
                    isCorrect,
                    question.getExplanation()
            ));
        }

        double scorePercentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;
        boolean passed = scorePercentage >= quiz.getPassingScore();

        return new QuizEvaluationResult(
                totalQuestions,
                correctCount,
                scorePercentage,
                passed,
                quiz.getPassingScore(),
                feedbackMap
        );
    }

    @Transactional(readOnly = true)
    public PlatformStatsResponse getStats() {
        return new PlatformStatsResponse(
                courseRepository.count(),
                moduleRepository.count(),
                lessonRepository.count(),
                quizRepository.count()
        );
    }
}
