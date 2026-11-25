package com.edumind.backend.dto;

import java.util.List;

public record SyllabusResponse(
        String courseTitle,
        String description,
        String targetAudience,
        List<ModuleDto> modules
) {
    public record ModuleDto(
            String title,
            String description,
            int orderIndex,
            List<LessonDto> lessons
    ) {}

    public record LessonDto(
            String title,
            int orderIndex
    ) {}
}