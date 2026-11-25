package com.edumind.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CourseRequest(
        @NotBlank(message = "Topic cannot be empty")
        String topic,

        @NotBlank(message = "Target audience cannot be empty")
        String targetAudience
) {}