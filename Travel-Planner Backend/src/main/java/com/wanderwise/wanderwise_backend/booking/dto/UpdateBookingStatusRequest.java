package com.wanderwise.wanderwise_backend.booking.dto;

import com.wanderwise.wanderwise_backend.booking.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(
        @NotNull(message = "Status is required")
        BookingStatus status,
        String adminNote
) {
}
