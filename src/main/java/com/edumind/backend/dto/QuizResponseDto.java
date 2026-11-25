package com.edumind.backend.dto;

import java.util.List;

public record QuizResponseDto(
        int passingScore,
        List<QuestionDto> questions
) {
    public record QuestionDto(
            String questionText,
            String explanation,
            List<OptionDto> options
    ) {}

    public record OptionDto(
            String optionText,
            boolean isCorrect
    ) {}
}