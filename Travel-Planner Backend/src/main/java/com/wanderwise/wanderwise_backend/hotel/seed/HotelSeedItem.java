package com.wanderwise.wanderwise_backend.hotel.seed;

import java.math.BigDecimal;
import java.util.List;

public record HotelSeedItem(
        String name,
        String destination,
        String country,
        String address,
        BigDecimal pricePerNight,
        String currency,
        BigDecimal rating,
        String img,
        List<String> amenities
) {
}
