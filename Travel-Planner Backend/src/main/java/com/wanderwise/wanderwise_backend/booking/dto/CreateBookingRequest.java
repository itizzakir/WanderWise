package com.wanderwise.wanderwise_backend.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateBookingRequest(
        @NotBlank(message = "Destination is required")
        String destination,
        @NotBlank(message = "Country is required")
        String country,
        @NotNull(message = "Travel date is required")
        @FutureOrPresent(message = "Travel date cannot be in the past")
        LocalDate travelDate,
        @NotBlank(message = "Transportation is required")
        String transportation,
        @NotEmpty(message = "At least one traveler is required")
        @Valid
        List<TravelerInput> travelers,
        @NotNull(message = "Amount per traveler is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Amount per traveler must be greater than 0")
        BigDecimal amountPerTraveler,
        String currency
) {
    public record TravelerInput(
            @NotBlank(message = "Traveler name is required")
            String name,
            @NotNull(message = "Traveler age is required")
            @Min(value = 1, message = "Traveler age must be at least 1")
            Integer age,
            @NotBlank(message = "Traveler gender is required")
            String gender
    ) {
    }
}
