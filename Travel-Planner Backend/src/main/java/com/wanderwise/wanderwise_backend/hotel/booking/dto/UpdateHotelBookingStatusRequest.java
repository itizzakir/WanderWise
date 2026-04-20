package com.wanderwise.wanderwise_backend.hotel.booking.dto;

import com.wanderwise.wanderwise_backend.hotel.booking.HotelBookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateHotelBookingStatusRequest(
        @NotNull(message = "Status is required")
        HotelBookingStatus status,
        @Size(max = 1000, message = "Admin note can be at most 1000 characters")
        String adminNote
) {
}
