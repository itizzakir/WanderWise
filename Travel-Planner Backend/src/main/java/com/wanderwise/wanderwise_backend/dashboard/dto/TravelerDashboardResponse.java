package com.wanderwise.wanderwise_backend.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record TravelerDashboardResponse(
        String travelerName,
        OverviewPayload overview,
        List<ActiveTripPayload> activeTrips,
        UpcomingTripPayload upcomingTrip,
        SavedPlacesPayload savedPlaces,
        List<ExploreDestinationPayload> exploreDestinations,
        List<BudgetActivityPayload> budgetActivities
) {
    public record OverviewPayload(
            Integer totalTrips,
            Integer upcomingTrips,
            Integer completedTrips,
            BigDecimal totalBudget,
            BigDecimal spentBudget,
            BigDecimal remainingBudget
    ) {
    }

    public record ActiveTripPayload(
            Long id,
            String bookingId,
            String destination,
            String country,
            String startDate,
            String endDate,
            String status,
            String imageUrl
    ) {
    }

    public record UpcomingTripPayload(
            Long id,
            String bookingId,
            String destination,
            String country,
            String startDate,
            String endDate,
            Integer daysLeft,
            String status,
            String bookingStatus,
            String transportation,
            String imageUrl,
            BigDecimal totalBudget,
            BigDecimal spentBudget
    ) {
    }

    public record SavedPlacesPayload(
            Integer total,
            List<SavedPlacePayload> topPlaces
    ) {
    }

    public record SavedPlacePayload(
            String destination,
            String country,
            String imageUrl
    ) {
    }

    public record ExploreDestinationPayload(
            String destination,
            String country,
            String imageUrl,
            String slug
    ) {
    }

    public record BudgetActivityPayload(
            Integer day,
            String title,
            String date,
            String location
    ) {
    }
}
