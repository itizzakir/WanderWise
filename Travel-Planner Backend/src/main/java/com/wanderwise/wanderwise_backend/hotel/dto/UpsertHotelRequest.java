package com.wanderwise.wanderwise_backend.hotel.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record UpsertHotelRequest(
        @NotBlank(message = "Hotel name is required")
        String name,
        @NotBlank(message = "Destination is required")
        String destination,
        @NotBlank(message = "Country is required")
        String country,
        @NotBlank(message = "Address is required")
        String address,
        @NotNull(message = "Price per night is required")
        @DecimalMin(value = "1.0", inclusive = true, message = "Price per night must be at least 1")
        BigDecimal pricePerNight,
        @NotBlank(message = "Currency is required")
        String currency,
        @NotNull(message = "Hotel rating is required")
        @DecimalMin(value = "1.0", inclusive = true, message = "Rating must be between 1 and 5")
        @DecimalMax(value = "5.0", inclusive = true, message = "Rating must be between 1 and 5")
        BigDecimal rating,
        @NotBlank(message = "Hotel image URL is required")
        String img,
        @Size(max = 20, message = "Amenities can contain at most 20 values")
        List<@NotBlank(message = "Amenity cannot be blank") String> amenities
) {
}
