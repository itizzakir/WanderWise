package com.wanderwise.wanderwise_backend.trip.dto;

import java.util.List;

public record TripDetailResponse(
        Long id,
        String bookingId,
        String destination,
        String country,
        String startDate,
        String endDate,
        String status,
        String bookingStatus,
        String transportation,
        String imageUrl,
        Integer travelersCount,
        List<ItineraryItemPayload> itinerary,
        List<TripSummaryResponse.CollaboratorPayload> collaborators,
        TripSummaryResponse.BudgetPayload budget
) {
    public record ItineraryItemPayload(
            Integer day,
            String title
    ) {
    }
}
