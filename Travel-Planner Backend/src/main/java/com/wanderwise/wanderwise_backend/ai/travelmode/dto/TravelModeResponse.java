package com.wanderwise.wanderwise_backend.ai.travelmode.dto;

import java.util.List;

public record TravelModeResponse(
        String recommendedMode,
        String reason,
        boolean aiEnhanced,
        List<TravelModeOptionDto> options
) {
}
