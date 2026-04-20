package com.wanderwise.wanderwise_backend.ai.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;

public record HotelRecommendationDto(
        Long id,
        String name,
        String destination,
        String country,
        String address,
        BigDecimal pricePerNight,
        BigDecimal estimatedStayCost,
        String currency,
        BigDecimal rating,
        String img,
        List<String> amenities,
        String matchReason
) {
}
