package com.wanderwise.wanderwise_backend.booking.dto;

import com.wanderwise.wanderwise_backend.booking.BookingRequest;
import java.math.BigDecimal;
import java.util.List;

public record BookingResponse(
        Long bookingRecordId,
        String id,
        String travelerName,
        String travelerEmail,
        String destination,
        String country,
        String travelDate,
        String transportation,
        Integer travelersCount,
        List<TravelerPayload> travelers,
        BigDecimal amountPerTraveler,
        BigDecimal totalAmount,
        String currency,
        String status,
        String requestedAt,
        String adminNote
) {
    public static BookingResponse fromEntity(
            BookingRequest booking,
            List<TravelerPayload> travelers
    ) {
        return new BookingResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getTravelerName(),
                booking.getTravelerEmail(),
                booking.getDestination(),
                booking.getCountry(),
                booking.getTravelDate().toString(),
                booking.getTransportation(),
                booking.getTravelersCount(),
                travelers,
                booking.getAmountPerTraveler(),
                booking.getTotalAmount(),
                booking.getCurrency(),
                booking.getStatus().name(),
                booking.getRequestedAt().toString(),
                booking.getAdminNote()
        );
    }

    public record TravelerPayload(
            String name,
            Integer age,
            String gender
    ) {
    }
}
