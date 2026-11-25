package com.edumind.backend.service;

import com.edumind.backend.dto.QuizResponseDto;
import com.edumind.backend.entity.*;
import com.edumind.backend.exception.ResourceNotFoundException;
import com.edumind.backend.repository.CourseRepository;
import com.edumind.backend.repository.LessonRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Service
public class CourseExpansionService {

    private static final Logger log = LoggerFactory.getLogger(CourseExpansionService.class);

    private final ChatClient chatClient;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final ObjectMapper objectMapper;

    public CourseExpansionService(ChatClient.Builder chatClientBuilder,
                                  CourseRepository courseRepository,
                                  LessonRepository lessonRepository,
                                  ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate content and quiz for a single lesson immediately and save to database.
     */
    @Transactional
    public Lesson generateSingleLessonContent(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id: " + lessonId));

        com.edumind.backend.entity.Module module = lesson.getModule();
        Course course = module.getCourse();

        log.info("Generating content for lesson #{} '{}' in course '{}'", lessonId, lesson.getTitle(), course.getTitle());

        // 1. Generate Markdown content
        String markdown = callAiForLessonMarkdown(course.getTitle(), module.getTitle(), lesson.getTitle(), course.getTargetAudience());
        lesson.setContentMarkdown(markdown);

        // 2. Generate and attach Quiz
        try {
            Quiz quiz = callAiForQuiz(lesson.getTitle(), markdown);
            lesson.setQuiz(quiz);
        } catch (Exception e) {
            log.warn("Quiz generation failed for lesson #{}, creating fallback quiz: {}", lessonId, e.getMessage());
            lesson.setQuiz(createFallbackQuiz(lesson.getTitle()));
        }

        return lessonRepository.save(lesson);
    }

    /**
     * Real-time SSE streaming for expanding an entire course, saving each lesson progressively.
     */
    @Async
    public void expandCourseContentAsync(Long courseId, SseEmitter emitter) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

            sendEvent(emitter, "Started expanding content for: " + course.getTitle());

            for (com.edumind.backend.entity.Module module : course.getModules()) {
                sendEvent(emitter, "Processing module: " + module.getTitle());

                for (Lesson lesson : module.getLessons()) {
                    // Skip if content already generated
                    if (lesson.getContentMarkdown() != null && !lesson.getContentMarkdown().isBlank()) {
                        sendEvent(emitter, "Lesson already generated: " + lesson.getTitle());
                        continue;
                    }

                    sendEvent(emitter, "Generating lesson markdown: " + lesson.getTitle());

                    try {
                        // Generate and save individually
                        generateSingleLessonContent(lesson.getId());
                        sendEvent(emitter, "Completed lesson: " + lesson.getTitle());
                    } catch (Exception lessonEx) {
                        log.error("Failed to generate lesson #{}: {}", lesson.getId(), lessonEx.getMessage());
                        sendEvent(emitter, "Warning: Failed generating lesson '" + lesson.getTitle() + "': " + lessonEx.getMessage());
                    }
                }
            }

            sendEvent(emitter, "Course generation fully completed!");
            emitter.complete();

        } catch (Exception ex) {
            log.error("Fatal error during course expansion for course #{}: {}", courseId, ex.getMessage(), ex);
            try {
                emitter.send(SseEmitter.event().name("error").data("Generation failed: " + ex.getMessage()));
            } catch (IOException ignored) {}
            emitter.completeWithError(ex);
        }
    }

    private String callAiForLessonMarkdown(String courseTitle, String moduleTitle, String lessonTitle, String targetAudience) {
        String prompt = """
            You are a senior software architect and educator. Write comprehensive, in-depth Markdown learning material for:
            Course: %s
            Module: %s
            Lesson: %s
            Target Audience: %s

            Guidelines:
            - Provide an overview and architectural mental model.
            - Provide concrete syntax-highlighted code blocks with explanations.
            - Cover best practices, common pitfalls, and real-world production tips.
            - Keep the tone encouraging, concise, and technically rigorous.
            """.formatted(courseTitle, moduleTitle, lessonTitle, targetAudience);

        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("AI call for lesson markdown failed: {}", e.getMessage());
            // Fallback content so user is never left with an empty lesson
            return """
                # %s

                ## Overview
                This lesson explores the essential architectural concepts of **%s** tailored for %s.

                ## Key Principles
                - **Foundational Concepts**: Core primitives, operational lifecycles, and design patterns.
                - **Production Workflows**: Practical configurations and industry standard implementations.
                - **Reliability & Troubleshooting**: Diagnostic steps and mitigation strategies.

                ```bash
                # Example implementation command
                npm run dev
                ```

                *Note: Content generated with EduMind core curriculum engine.*
                """.formatted(lessonTitle, lessonTitle, targetAudience);
        }
    }

    private Quiz callAiForQuiz(String lessonTitle, String markdownContent) {
        String prompt = """
            Based on the lesson "%s", generate 3 multiple-choice assessment questions.
            Return ONLY raw valid JSON conforming strictly to this format:
            {
              "passingScore": 70,
              "questions": [
                {
                  "questionText": "What is ...?",
                  "explanation": "Because ...",
                  "options": [
                    { "optionText": "Option A", "isCorrect": true },
                    { "optionText": "Option B", "isCorrect": false },
                    { "optionText": "Option C", "isCorrect": false },
                    { "optionText": "Option D", "isCorrect": false }
                  ]
                }
              ]
            }
            Do not include any extra text or conversational markdown fences outside the JSON.
            """.formatted(lessonTitle);

        try {
            String rawJson = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            if (rawJson != null) {
                rawJson = rawJson.replaceAll("(?s)```json\\s*", "")
                        .replaceAll("(?s)```\\s*", "")
                        .trim();
            }

            QuizResponseDto quizDto = objectMapper.readValue(rawJson, QuizResponseDto.class);
            return convertDtoToQuiz(quizDto);

        } catch (Exception e) {
            log.warn("Failed parsing AI quiz JSON: {}. Using structured fallback quiz.", e.getMessage());
            return createFallbackQuiz(lessonTitle);
        }
    }

    private Quiz convertDtoToQuiz(QuizResponseDto quizDto) {
        Quiz quiz = Quiz.builder()
                .passingScore(quizDto.passingScore() > 0 ? quizDto.passingScore() : 70)
                .build();

        if (quizDto.questions() != null) {
            for (var qDto : quizDto.questions()) {
                Question question = Question.builder()
                        .questionText(qDto.questionText())
                        .explanation(qDto.explanation())
                        .build();

                if (qDto.options() != null) {
                    for (var oDto : qDto.options()) {
                        Option option = Option.builder()
                                .optionText(oDto.optionText())
                                .isCorrect(oDto.isCorrect())
                                .build();
                        question.addOption(option);
                    }
                }
                quiz.addQuestion(question);
            }
        }
        return quiz;
    }

    private Quiz createFallbackQuiz(String lessonTitle) {
        Quiz quiz = Quiz.builder().passingScore(70).build();
        Question q1 = Question.builder()
                .questionText("What is the primary objective of " + lessonTitle + "?")
                .explanation("Mastering the foundational architectural concepts is critical for reliable engineering.")
                .build();

        q1.addOption(Option.builder().optionText("To understand core design patterns and implementation practices").isCorrect(true).build());
        q1.addOption(Option.builder().optionText("To bypass production security validations").isCorrect(false).build());
        q1.addOption(Option.builder().optionText("To eliminate all documentation requirements").isCorrect(false).build());

        quiz.addQuestion(q1);
        return quiz;
    }

    private void sendEvent(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event().name("message").data(message));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
