package com.edumind.backend.dto;

public record PlatformStatsResponse(
        long totalCourses,
        long totalModules,
        long totalLessons,
        long totalQuizzes
) {}
