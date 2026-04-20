package com.wanderwise.wanderwise_backend.ai.recommendation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record RecommendationRequest(
        @NotBlank(message = "Destination is required")
        @Size(max = 120, message = "Destination can be up to 120 characters")
        String destination,

        @NotNull(message = "Budget is required")
        @DecimalMin(value = "1.0", message = "Budget must be greater than zero")
        BigDecimal budget,

        @NotNull(message = "Number of days is required")
        @Min(value = 1, message = "Number of days must be at least 1")
        Integer numberOfDays,

        List<@Size(max = 50, message = "Each preference can be up to 50 characters") String> preferences
) {
}
