package com.wanderwise.wanderwise_backend.admin.recommendation.dto;

import java.util.List;

public record AdminRecommendationsResponse(
        String generatedAt,
        SummaryPayload summary,
        List<RecommendationItemPayload> destinationRecommendations,
        List<RecommendationItemPayload> pricingRecommendations,
        List<RecommendationItemPayload> timingRecommendations
) {
    public record SummaryPayload(
            Integer totalRecommendations,
            Integer destinationRecommendations,
            Integer pricingRecommendations,
            Integer timingRecommendations
    ) {
    }

    public record RecommendationItemPayload(
            String id,
            String category,
            String severity,
            String title,
            String insight,
            String action,
            String metricLabel,
            String metricValue
    ) {
    }
}
