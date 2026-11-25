package com.edumind.backend.dto;

import java.util.Map;

public record QuizEvaluationResult(
        int totalQuestions,
        int correctAnswers,
        double scorePercentage,
        boolean passed,
        int passingScore,
        Map<Long, QuestionFeedback> feedback
) {
    public record QuestionFeedback(
            Long selectedOptionId,
            Long correctOptionId,
            boolean isCorrect,
            String explanation
    ) {}
}
