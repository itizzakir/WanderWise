package com.wanderwise.wanderwise_backend.ai.travelmode.dto;

import java.math.BigDecimal;

public record TravelModeOptionDto(
        String mode,
        BigDecimal estimatedCost,
        double estimatedHours,
        int suitabilityScore,
        String reason
) {
}
