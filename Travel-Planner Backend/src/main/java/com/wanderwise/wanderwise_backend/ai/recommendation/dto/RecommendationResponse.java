package com.wanderwise.wanderwise_backend.ai.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;

public record RecommendationResponse(
        String destination,
        BigDecimal budget,
        Integer numberOfDays,
        List<String> preferences,
        String explanation,
        String dataStrategy,
        boolean aiEnhanced,
        List<HotelRecommendationDto> hotels,
        List<TourRecommendationDto> tours,
        List<String> suggestedItinerary
) {
}
