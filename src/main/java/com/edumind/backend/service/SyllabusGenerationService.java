package com.edumind.backend.service;

import com.edumind.backend.dto.SyllabusResponse;
import com.edumind.backend.entity.Course;
import com.edumind.backend.entity.Lesson;
import com.edumind.backend.entity.Module;
import com.edumind.backend.repository.CourseRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SyllabusGenerationService {

    private final ChatClient chatClient;
    private final CourseRepository courseRepository;

    public SyllabusGenerationService(ChatClient.Builder chatClientBuilder, CourseRepository courseRepository) {
        this.chatClient = chatClientBuilder.build();
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Course generateAndSaveSyllabus(String topic, String targetAudience) {
        var outputConverter = new BeanOutputConverter<>(SyllabusResponse.class);

        String prompt = """
            You are an expert curriculum designer and educator.
            Design a structured, comprehensive multi-module syllabus on the topic: {topic}.
            Target Audience: {targetAudience}.
            
            Strictly format your response as JSON according to this schema:
            {format}
            """;

        String rawResponse = chatClient.prompt()
                .user(u -> u.text(prompt)
                        .param("topic", topic)
                        .param("targetAudience", targetAudience)
                        .param("format", outputConverter.getFormat()))
                .call()
                .content();

        // Sanitize any markdown markdown fences from Gemini
        if (rawResponse != null) {
            rawResponse = rawResponse.replaceAll("(?s)```json\\s*", "")
                    .replaceAll("(?s)```\\s*", "")
                    .trim();
        }

        SyllabusResponse parsed = outputConverter.convert(rawResponse);

        Course course = Course.builder()
                .title(parsed.courseTitle())
                .description(parsed.description())
                .targetAudience(parsed.targetAudience())
                .build();

        if (parsed.modules() != null) {
            for (var modDto : parsed.modules()) {
                Module module = Module.builder()
                        .title(modDto.title())
                        .description(modDto.description())
                        .orderIndex(modDto.orderIndex())
                        .build();

                if (modDto.lessons() != null) {
                    for (var lesDto : modDto.lessons()) {
                        Lesson lesson = Lesson.builder()
                                .title(lesDto.title())
                                .orderIndex(lesDto.orderIndex())
                                .build();
                        module.addLesson(lesson);
                    }
                }
                course.addModule(module);
            }
        }

        return courseRepository.save(course);
    }
}