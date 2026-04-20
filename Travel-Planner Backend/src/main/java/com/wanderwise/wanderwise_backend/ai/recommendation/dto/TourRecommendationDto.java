package com.wanderwise.wanderwise_backend.ai.recommendation.dto;

import java.util.List;

public record TourRecommendationDto(
        Long id,
        String destination,
        String country,
        String category,
        String description,
        Integer duration,
        String img,
        String slug,
        List<String> plan,
        String matchReason
) {
}
