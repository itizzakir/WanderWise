package com.wanderwise.wanderwise_backend.dashboard;

import com.wanderwise.wanderwise_backend.dashboard.dto.TravelerDashboardResponse;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import com.wanderwise.wanderwise_backend.trip.TripService;
import com.wanderwise.wanderwise_backend.trip.dto.TripDetailResponse;
import com.wanderwise.wanderwise_backend.trip.dto.TripSummaryResponse;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TravelerDashboardService {

    private static final String UPCOMING_STATUS = "Upcoming";
    private static final String COMPLETED_STATUS = "Completed";
    private static final String FALLBACK_IMAGE_URL =
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60";

    private final UserRepository userRepository;
    private final TripService tripService;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public TravelerDashboardResponse getDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<TripSummaryResponse> trips = tripService.getMyTrips(userEmail);
        List<TripSummaryResponse> upcomingTrips = trips.stream()
                .filter(entry -> UPCOMING_STATUS.equalsIgnoreCase(entry.status()))
                .sorted(Comparator.comparing(entry -> parseLocalDate(entry.startDate())))
                .toList();

        TripSummaryResponse nearestUpcomingTrip = upcomingTrips.isEmpty() ? null : upcomingTrips.get(0);
        TripDetailResponse nearestUpcomingTripDetail = nearestUpcomingTrip != null
                ? tripService.getMyTripDetails(userEmail, nearestUpcomingTrip.id())
                : null;

        return new TravelerDashboardResponse(
                user.getName(),
                buildOverview(trips),
                buildActiveTrips(upcomingTrips),
                buildUpcomingTrip(nearestUpcomingTrip, nearestUpcomingTripDetail),
                buildSavedPlaces(trips),
                buildExploreDestinations(),
                buildBudgetActivities(nearestUpcomingTripDetail)
        );
    }

    private TravelerDashboardResponse.OverviewPayload buildOverview(List<TripSummaryResponse> trips) {
        int totalTrips = trips.size();
        int upcomingTrips = 0;
        int completedTrips = 0;
        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal spentBudget = BigDecimal.ZERO;

        for (TripSummaryResponse trip : trips) {
            boolean isUpcoming = UPCOMING_STATUS.equalsIgnoreCase(trip.status());
            boolean isCompleted = COMPLETED_STATUS.equalsIgnoreCase(trip.status());
            BigDecimal tripBudget = trip.budget() != null && trip.budget().total() != null
                    ? trip.budget().total()
                    : BigDecimal.ZERO;

            if (isUpcoming) {
                upcomingTrips++;
            }

            if (isCompleted) {
                completedTrips++;
                spentBudget = spentBudget.add(tripBudget);
            }

            totalBudget = totalBudget.add(tripBudget);
        }

        BigDecimal remainingBudget = totalBudget.subtract(spentBudget).max(BigDecimal.ZERO);

        return new TravelerDashboardResponse.OverviewPayload(
                totalTrips,
                upcomingTrips,
                completedTrips,
                totalBudget,
                spentBudget,
                remainingBudget
        );
    }

    private List<TravelerDashboardResponse.ActiveTripPayload> buildActiveTrips(List<TripSummaryResponse> upcomingTrips) {
        return upcomingTrips.stream()
                .limit(2)
                .map(entry -> new TravelerDashboardResponse.ActiveTripPayload(
                        entry.id(),
                        entry.bookingId(),
                        entry.destination(),
                        entry.country(),
                        entry.startDate(),
                        entry.endDate(),
                        entry.status(),
                        normalizeImage(entry.imageUrl())
                ))
                .toList();
    }

    private TravelerDashboardResponse.UpcomingTripPayload buildUpcomingTrip(
            TripSummaryResponse nearestUpcomingTrip,
            TripDetailResponse nearestUpcomingTripDetail
    ) {
        if (nearestUpcomingTrip == null || nearestUpcomingTripDetail == null) {
            return null;
        }

        LocalDate startDate = parseLocalDate(nearestUpcomingTrip.startDate());
        int daysLeft = (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), startDate));

        BigDecimal totalBudget = nearestUpcomingTrip.budget() != null && nearestUpcomingTrip.budget().total() != null
                ? nearestUpcomingTrip.budget().total()
                : BigDecimal.ZERO;
        BigDecimal spentBudget = COMPLETED_STATUS.equalsIgnoreCase(nearestUpcomingTrip.status())
                ? totalBudget
                : BigDecimal.ZERO;

        return new TravelerDashboardResponse.UpcomingTripPayload(
                nearestUpcomingTrip.id(),
                nearestUpcomingTrip.bookingId(),
                nearestUpcomingTrip.destination(),
                nearestUpcomingTrip.country(),
                nearestUpcomingTrip.startDate(),
                nearestUpcomingTrip.endDate(),
                daysLeft,
                nearestUpcomingTrip.status(),
                nearestUpcomingTrip.bookingStatus(),
                nearestUpcomingTripDetail.transportation(),
                normalizeImage(nearestUpcomingTrip.imageUrl()),
                totalBudget,
                spentBudget
        );
    }

    private TravelerDashboardResponse.SavedPlacesPayload buildSavedPlaces(List<TripSummaryResponse> trips) {
        Map<String, TravelerDashboardResponse.SavedPlacePayload> uniquePlaces = new LinkedHashMap<>();

        for (TripSummaryResponse trip : trips) {
            String destination = trip.destination() == null ? "" : trip.destination().trim();
            String country = trip.country() == null ? "" : trip.country().trim();
            String key = (destination + "|" + country).toLowerCase();

            if (!uniquePlaces.containsKey(key)) {
                uniquePlaces.put(
                        key,
                        new TravelerDashboardResponse.SavedPlacePayload(
                                destination,
                                country,
                                normalizeImage(trip.imageUrl())
                        )
                );
            }
        }

        List<TravelerDashboardResponse.SavedPlacePayload> topPlaces = uniquePlaces.values()
                .stream()
                .limit(3)
                .toList();

        return new TravelerDashboardResponse.SavedPlacesPayload(uniquePlaces.size(), topPlaces);
    }

    private List<TravelerDashboardResponse.ExploreDestinationPayload> buildExploreDestinations() {
        return tourRepository.findTop3ByOrderByDestinationAsc()
                .stream()
                .map(this::toExploreDestination)
                .toList();
    }

    private TravelerDashboardResponse.ExploreDestinationPayload toExploreDestination(Tour tour) {
        return new TravelerDashboardResponse.ExploreDestinationPayload(
                tour.getDestination(),
                tour.getCountry(),
                normalizeImage(tour.getImg()),
                tour.getSlug()
        );
    }

    private List<TravelerDashboardResponse.BudgetActivityPayload> buildBudgetActivities(
            TripDetailResponse nearestUpcomingTripDetail
    ) {
        if (nearestUpcomingTripDetail == null || nearestUpcomingTripDetail.itinerary() == null) {
            return List.of();
        }

        LocalDate tripStartDate = parseLocalDate(nearestUpcomingTripDetail.startDate());
        List<TravelerDashboardResponse.BudgetActivityPayload> activities = new ArrayList<>();

        for (TripDetailResponse.ItineraryItemPayload itineraryItem : nearestUpcomingTripDetail.itinerary()) {
            if (activities.size() >= 3) {
                break;
            }

            int dayNumber = itineraryItem.day() != null && itineraryItem.day() > 0 ? itineraryItem.day() : 1;
            LocalDate activityDate = tripStartDate.plusDays(dayNumber - 1L);

            activities.add(new TravelerDashboardResponse.BudgetActivityPayload(
                    dayNumber,
                    itineraryItem.title(),
                    activityDate.toString(),
                    nearestUpcomingTripDetail.destination() + ", " + nearestUpcomingTripDetail.country()
            ));
        }

        return activities;
    }

    private LocalDate parseLocalDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception _ignored) {
            return LocalDate.now();
        }
    }

    private String normalizeImage(String imageUrl) {
        return Optional.ofNullable(imageUrl)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse(FALLBACK_IMAGE_URL);
    }
}
