package com.wanderwise.wanderwise_backend.hotel.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateHotelBookingRequest(
        @NotNull(message = "Hotel ID is required")
        Long hotelId,
        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in date cannot be in the past")
        LocalDate checkInDate,
        @NotNull(message = "Check-out date is required")
        @FutureOrPresent(message = "Check-out date cannot be in the past")
        LocalDate checkOutDate,
        @NotNull(message = "Guests count is required")
        @Min(value = 1, message = "Guests count must be at least 1")
        Integer guestsCount,
        @NotNull(message = "Room count is required")
        @Min(value = 1, message = "Room count must be at least 1")
        Integer roomCount,
        @Size(max = 1000, message = "Special request can be at most 1000 characters")
        String specialRequest
) {
}
