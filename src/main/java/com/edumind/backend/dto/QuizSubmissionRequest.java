package com.edumind.backend.dto;

import java.util.Map;

public record QuizSubmissionRequest(
        Map<Long, Long> selectedOptionIds // questionId -> optionId
) {}
