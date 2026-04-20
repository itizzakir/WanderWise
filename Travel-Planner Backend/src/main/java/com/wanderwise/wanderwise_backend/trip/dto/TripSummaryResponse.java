package com.wanderwise.wanderwise_backend.trip.dto;

import java.math.BigDecimal;
import java.util.List;

public record TripSummaryResponse(
        Long id,
        String bookingId,
        String destination,
        String country,
        String startDate,
        String endDate,
        String status,
        String bookingStatus,
        String imageUrl,
        Integer travelersCount,
        List<CollaboratorPayload> collaborators,
        BudgetPayload budget
) {
    public record BudgetPayload(
            BigDecimal total,
            BigDecimal spent
    ) {
    }

    public record CollaboratorPayload(
            Long id,
            String name,
            String avatarUrl
    ) {
    }
}
