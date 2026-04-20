package com.wanderwise.wanderwise_backend.trip;

import com.wanderwise.wanderwise_backend.booking.BookingRequest;
import com.wanderwise.wanderwise_backend.booking.BookingRequestRepository;
import com.wanderwise.wanderwise_backend.booking.BookingStatus;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import com.wanderwise.wanderwise_backend.trip.dto.TripDetailResponse;
import com.wanderwise.wanderwise_backend.trip.dto.TripSummaryResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TripService {

    private static final String FALLBACK_IMAGE_URL =
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60";

    private final BookingRequestRepository bookingRequestRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public List<TripSummaryResponse> getMyTrips(String userEmail) {
        Map<String, Optional<Tour>> matchedTours = new HashMap<>();
        return bookingRequestRepository.findAllByUserEmailOrderByRequestedAtDesc(userEmail)
                .stream()
                .filter(this::isVisibleTrip)
                .map(booking -> toTripSummary(booking, matchedTours))
                .toList();
    }

    @Transactional(readOnly = true)
    public TripDetailResponse getMyTripDetails(String userEmail, Long bookingRecordId) {
        BookingRequest booking = bookingRequestRepository.findByIdAndUserEmail(bookingRecordId, userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        if (!isVisibleTrip(booking)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }

        Optional<Tour> optionalTour = findMatchingTour(booking);
        LocalDate endDate = calculateEndDate(booking, optionalTour);
        String tripStatus = toTripTimelineStatus(endDate);
        List<TripDetailResponse.ItineraryItemPayload> itinerary = buildItinerary(optionalTour);

        TripSummaryResponse.BudgetPayload budget = new TripSummaryResponse.BudgetPayload(
                booking.getTotalAmount(),
                booking.getTotalAmount()
        );

        return new TripDetailResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getDestination(),
                booking.getCountry(),
                booking.getTravelDate().toString(),
                endDate.toString(),
                tripStatus,
                booking.getStatus().name(),
                booking.getTransportation(),
                optionalTour.map(Tour::getImg).filter(value -> !value.isBlank()).orElse(FALLBACK_IMAGE_URL),
                booking.getTravelersCount(),
                itinerary,
                List.of(),
                budget
        );
    }

    private TripSummaryResponse toTripSummary(BookingRequest booking, Map<String, Optional<Tour>> matchedTours) {
        Optional<Tour> optionalTour = findMatchingTour(booking, matchedTours);
        LocalDate endDate = calculateEndDate(booking, optionalTour);
        String tripStatus = toTripTimelineStatus(endDate);
        BigDecimal totalAmount = booking.getTotalAmount();

        return new TripSummaryResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getDestination(),
                booking.getCountry(),
                booking.getTravelDate().toString(),
                endDate.toString(),
                tripStatus,
                booking.getStatus().name(),
                optionalTour.map(Tour::getImg).filter(value -> !value.isBlank()).orElse(FALLBACK_IMAGE_URL),
                booking.getTravelersCount(),
                List.of(),
                new TripSummaryResponse.BudgetPayload(totalAmount, totalAmount)
        );
    }

    private Optional<Tour> findMatchingTour(BookingRequest booking) {
        return tourRepository.findByDestinationIgnoreCaseAndCountryIgnoreCase(
                booking.getDestination(),
                booking.getCountry()
        );
    }

    private Optional<Tour> findMatchingTour(BookingRequest booking, Map<String, Optional<Tour>> matchedTours) {
        String tourKey = buildTourKey(booking.getDestination(), booking.getCountry());
        return matchedTours.computeIfAbsent(tourKey, _ignored -> findMatchingTour(booking));
    }

    private String buildTourKey(String destination, String country) {
        String normalizedDestination = destination == null ? "" : destination.trim().toLowerCase(Locale.ENGLISH);
        String normalizedCountry = country == null ? "" : country.trim().toLowerCase(Locale.ENGLISH);
        return normalizedDestination + "|" + normalizedCountry;
    }

    private LocalDate calculateEndDate(BookingRequest booking, Optional<Tour> optionalTour) {
        int duration = optionalTour.map(Tour::getDuration).filter(value -> value != null && value > 0).orElse(1);
        return booking.getTravelDate().plusDays(duration - 1L);
    }

    private String toTripTimelineStatus(LocalDate endDate) {
        return endDate.isBefore(LocalDate.now()) ? "Completed" : "Upcoming";
    }

    private boolean isVisibleTrip(BookingRequest booking) {
        BookingStatus status = booking.getStatus();
        return status != BookingStatus.PENDING_PAYMENT && status != BookingStatus.REJECTED;
    }

    private List<TripDetailResponse.ItineraryItemPayload> buildItinerary(Optional<Tour> optionalTour) {
        List<String> plan = optionalTour.map(Tour::getPlan).orElse(List.of());
        if (plan.isEmpty()) {
            return List.of(
                    new TripDetailResponse.ItineraryItemPayload(1, "Arrival and hotel check-in."),
                    new TripDetailResponse.ItineraryItemPayload(2, "Guided local sightseeing."),
                    new TripDetailResponse.ItineraryItemPayload(3, "Free day for exploration and shopping.")
            );
        }

        List<TripDetailResponse.ItineraryItemPayload> itinerary = new ArrayList<>();
        for (int index = 0; index < plan.size(); index++) {
            itinerary.add(new TripDetailResponse.ItineraryItemPayload(index + 1, plan.get(index)));
        }
        return itinerary;
    }
}
