package com.wanderwise.wanderwise_backend.hotel.dto;

import com.wanderwise.wanderwise_backend.hotel.Hotel;
import java.math.BigDecimal;
import java.util.List;

public record HotelResponse(
        Long id,
        String name,
        String destination,
        String country,
        String address,
        BigDecimal pricePerNight,
        String currency,
        BigDecimal rating,
        String img,
        String slug,
        List<String> amenities
) {
    public static HotelResponse fromEntity(Hotel hotel) {
        return new HotelResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getDestination(),
                hotel.getCountry(),
                hotel.getAddress(),
                hotel.getPricePerNight(),
                hotel.getCurrency(),
                hotel.getRating(),
                hotel.getImg(),
                hotel.getSlug(),
                hotel.getAmenities()
        );
    }
}
