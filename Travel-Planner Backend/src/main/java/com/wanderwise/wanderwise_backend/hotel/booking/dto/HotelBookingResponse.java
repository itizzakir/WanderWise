package com.wanderwise.wanderwise_backend.hotel.booking.dto;

import com.wanderwise.wanderwise_backend.hotel.booking.HotelBookingRequest;
import java.math.BigDecimal;

public record HotelBookingResponse(
        Long hotelBookingRecordId,
        String bookingId,
        Long hotelId,
        String hotelName,
        String travelerName,
        String travelerEmail,
        String destination,
        String country,
        String checkInDate,
        String checkOutDate,
        Integer nights,
        Integer guestsCount,
        Integer roomCount,
        BigDecimal amountPerNight,
        BigDecimal totalAmount,
        String currency,
        String status,
        String requestedAt,
        String specialRequest,
        String adminNote
) {
    public static HotelBookingResponse fromEntity(HotelBookingRequest booking) {
        return new HotelBookingResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getHotelId(),
                booking.getHotelName(),
                booking.getTravelerName(),
                booking.getTravelerEmail(),
                booking.getDestination(),
                booking.getCountry(),
                booking.getCheckInDate().toString(),
                booking.getCheckOutDate().toString(),
                booking.getNights(),
                booking.getGuestsCount(),
                booking.getRoomCount(),
                booking.getAmountPerNight(),
                booking.getTotalAmount(),
                booking.getCurrency(),
                booking.getStatus().name(),
                booking.getRequestedAt().toString(),
                booking.getSpecialRequest(),
                booking.getAdminNote()
        );
    }
}
