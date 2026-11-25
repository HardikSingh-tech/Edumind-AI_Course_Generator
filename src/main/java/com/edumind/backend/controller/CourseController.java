package com.edumind.backend.controller;

import com.edumind.backend.dto.ApiResponse;
import com.edumind.backend.dto.CourseRequest;
import com.edumind.backend.dto.PlatformStatsResponse;
import com.edumind.backend.dto.QuizEvaluationResult;
import com.edumind.backend.dto.QuizSubmissionRequest;
import com.edumind.backend.entity.Course;
import com.edumind.backend.entity.Lesson;
import com.edumind.backend.service.CourseExpansionService;
import com.edumind.backend.service.CourseService;
import com.edumind.backend.service.SyllabusGenerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final SyllabusGenerationService syllabusService;
    private final CourseExpansionService expansionService;
    private final CourseService courseService;

    public CourseController(SyllabusGenerationService syllabusService,
                            CourseExpansionService expansionService,
                            CourseService courseService) {
        this.syllabusService = syllabusService;
        this.expansionService = expansionService;
        this.courseService = courseService;
    }

    @PostMapping("/syllabus")
    public ResponseEntity<ApiResponse<Course>> createSyllabus(@Valid @RequestBody CourseRequest request) {
        Course course = syllabusService.generateAndSaveSyllabus(request.topic(), request.targetAudience());
        return ResponseEntity.ok(ApiResponse.success(course, "Syllabus created successfully"));
    }

    @GetMapping(value = "/{courseId}/expand-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCourseExpansion(@PathVariable Long courseId) {
        SseEmitter emitter = new SseEmitter(600_000L); // 10 minutes timeout
        expansionService.expandCourseContentAsync(courseId, emitter);
        return emitter;
    }

    @PostMapping("/lessons/{lessonId}/generate")
    public ResponseEntity<ApiResponse<Lesson>> generateSingleLesson(@PathVariable Long lessonId) {
        Lesson lesson = expansionService.generateSingleLessonContent(lessonId);
        return ResponseEntity.ok(ApiResponse.success(lesson, "Lesson content and quiz generated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        Page<Course> paged = courseService.getCoursesPaged(null, null, 0, 100, "createdAt", "desc");
        return ResponseEntity.ok(ApiResponse.success(paged.getContent(), "Courses retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Course>>> searchCourses(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String audience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<Course> result = courseService.getCoursesPaged(query, audience, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(result, "Search results retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseById(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success(course, "Course details retrieved"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted successfully"));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizEvaluationResult>> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizSubmissionRequest submission
    ) {
        QuizEvaluationResult result = courseService.evaluateQuiz(quizId, submission);
        return ResponseEntity.ok(ApiResponse.success(result, "Quiz evaluated successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<PlatformStatsResponse>> getStats() {
        PlatformStatsResponse stats = courseService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Platform stats retrieved"));
    }
}
