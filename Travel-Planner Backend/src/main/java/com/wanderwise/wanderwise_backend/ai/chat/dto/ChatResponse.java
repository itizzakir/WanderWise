package com.wanderwise.wanderwise_backend.ai.chat.dto;

import java.util.List;

public record ChatResponse(
        String conversationId,
        String answer,
        boolean databaseBacked,
        boolean aiEnhanced,
        String matchedDestination,
        String matchedCountry,
        List<ChatHotelDto> hotels,
        List<ChatTourDto> tours,
        List<ChatMessageDto> history
) {
    public record ChatHotelDto(
            Long id,
            String name,
            String destination,
            String country,
            String address,
            String pricePerNight,
            String currency,
            String rating,
            List<String> amenities
    ) {
    }

    public record ChatTourDto(
            Long id,
            String destination,
            String country,
            String category,
            Integer duration,
            String description,
            List<String> plan
    ) {
    }
}
