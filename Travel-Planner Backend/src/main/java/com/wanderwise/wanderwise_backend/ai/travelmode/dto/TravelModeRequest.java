package com.wanderwise.wanderwise_backend.ai.travelmode.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TravelModeRequest(
        @NotBlank(message = "Origin is required")
        @Size(max = 120, message = "Origin can be up to 120 characters")
        String origin,

        @NotBlank(message = "Destination is required")
        @Size(max = 120, message = "Destination can be up to 120 characters")
        String destination,

        @NotNull(message = "Distance is required")
        @Min(value = 1, message = "Distance must be at least 1 km")
        Integer distanceKm,

        @NotNull(message = "Budget is required")
        @DecimalMin(value = "1.0", message = "Budget must be greater than zero")
        BigDecimal budget,

        @NotNull(message = "Available time is required")
        @DecimalMin(value = "0.5", message = "Available time must be at least 0.5 hours")
        Double availableHours
) {
}
