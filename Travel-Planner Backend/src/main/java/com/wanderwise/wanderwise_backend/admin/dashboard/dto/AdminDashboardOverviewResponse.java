package com.wanderwise.wanderwise_backend.admin.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardOverviewResponse(
        TotalsPayload totals,
        List<BookingOverviewPoint> bookingsOverview,
        List<UserRowPayload> users,
        List<RecentBookingPayload> recentBookings,
        BudgetPayload budget,
        List<SystemAlertPayload> systemAlerts,
        List<PopularDestinationPayload> popularDestinations
) {
    public record TotalsPayload(
            Long totalUsers,
            Long activeTrips,
            Long totalBookings,
            BigDecimal totalRevenue
    ) {
    }

    public record BookingOverviewPoint(
            String name,
            Long bookings
    ) {
    }

    public record UserRowPayload(
            Long id,
            String name,
            String email,
            String status,
            String avatar
    ) {
    }

    public record RecentBookingPayload(
            Long bookingRecordId,
            String id,
            String travelerName,
            String status
    ) {
    }

    public record BudgetPayload(
            BigDecimal spent,
            BigDecimal target,
            BigDecimal remaining
    ) {
    }

    public record SystemAlertPayload(
            String severity,
            String title,
            String message
    ) {
    }

    public record PopularDestinationPayload(
            String city,
            String country,
            String imageUrl,
            Long bookingsCount
    ) {
    }
}
