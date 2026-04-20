package com.wanderwise.wanderwise_backend.admin.recommendation;

import com.wanderwise.wanderwise_backend.admin.recommendation.dto.AdminRecommendationsResponse;
import com.wanderwise.wanderwise_backend.booking.BookingRequest;
import com.wanderwise.wanderwise_backend.booking.BookingRequestRepository;
import com.wanderwise.wanderwise_backend.booking.BookingStatus;
import com.wanderwise.wanderwise_backend.payment.PaymentRecord;
import com.wanderwise.wanderwise_backend.payment.PaymentRecordRepository;
import com.wanderwise.wanderwise_backend.payment.PaymentStatus;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRecommendationService {

    private final BookingRequestRepository bookingRequestRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public AdminRecommendationsResponse getRecommendations() {
        List<BookingRequest> bookings = bookingRequestRepository.findAllByOrderByRequestedAtDesc();
        List<PaymentRecord> payments = paymentRecordRepository.findAllByOrderByPaidAtDesc();
        List<Tour> tours = tourRepository.findAllByOrderByDestinationAsc();

        List<AdminRecommendationsResponse.RecommendationItemPayload> destinationRecommendations =
                buildDestinationRecommendations(bookings, tours);
        List<AdminRecommendationsResponse.RecommendationItemPayload> pricingRecommendations =
                buildPricingRecommendations(bookings, payments);
        List<AdminRecommendationsResponse.RecommendationItemPayload> timingRecommendations =
                buildTimingRecommendations(bookings);

        int total = destinationRecommendations.size()
                + pricingRecommendations.size()
                + timingRecommendations.size();

        AdminRecommendationsResponse.SummaryPayload summary = new AdminRecommendationsResponse.SummaryPayload(
                total,
                destinationRecommendations.size(),
                pricingRecommendations.size(),
                timingRecommendations.size()
        );

        return new AdminRecommendationsResponse(
                LocalDateTime.now().toString(),
                summary,
                destinationRecommendations,
                pricingRecommendations,
                timingRecommendations
        );
    }

    private List<AdminRecommendationsResponse.RecommendationItemPayload> buildDestinationRecommendations(
            List<BookingRequest> bookings,
            List<Tour> tours
    ) {
        Map<String, Long> bookingCountByDestination = new HashMap<>();
        for (BookingRequest booking : bookings) {
            String key = destinationKey(booking.getDestination(), booking.getCountry());
            bookingCountByDestination.put(key, bookingCountByDestination.getOrDefault(key, 0L) + 1L);
        }

        List<Map.Entry<String, Long>> highDemandDestinations = bookingCountByDestination.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(2)
                .toList();

        List<AdminRecommendationsResponse.RecommendationItemPayload> recommendations = new ArrayList<>();
        int index = 1;

        for (Map.Entry<String, Long> entry : highDemandDestinations) {
            String destination = formatDestination(entry.getKey());
            long requests = entry.getValue();

            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "DEST-" + index++,
                    "DESTINATIONS",
                    requests >= 5 ? "HIGH" : "MEDIUM",
                    "Scale inventory for " + destination,
                    requests + " booking request(s) detected for this destination.",
                    "Increase featured slots, vendor allocation, and campaign visibility.",
                    "Requests",
                    String.valueOf(requests)
            ));
        }

        Tour lowDemandTour = tours.stream()
                .filter(tour -> bookingCountByDestination.getOrDefault(destinationKey(tour.getDestination(), tour.getCountry()), 0L) == 0L)
                .findFirst()
                .orElse(null);

        if (lowDemandTour != null) {
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "DEST-" + index,
                    "DESTINATIONS",
                    "LOW",
                    "Improve visibility for " + lowDemandTour.getDestination() + ", " + lowDemandTour.getCountry(),
                    "No bookings recorded yet for this destination.",
                    "Launch a spotlight campaign and add entry offers.",
                    "Current Bookings",
                    "0"
            ));
        }

        if (recommendations.isEmpty()) {
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "DEST-1",
                    "DESTINATIONS",
                    "INFO",
                    "Collect destination trend data",
                    "No destination-level booking data available yet.",
                    "Capture booking activity before generating optimization rules.",
                    "Requests",
                    "0"
            ));
        }

        return recommendations;
    }

    private List<AdminRecommendationsResponse.RecommendationItemPayload> buildPricingRecommendations(
            List<BookingRequest> bookings,
            List<PaymentRecord> payments
    ) {
        List<AdminRecommendationsResponse.RecommendationItemPayload> recommendations = new ArrayList<>();

        long totalPayments = payments.size();
        long successfulPayments = payments.stream()
                .filter(entry -> entry.getStatus() == PaymentStatus.SUCCESS)
                .count();

        BigDecimal successRate = totalPayments == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(successfulPayments * 100.0 / totalPayments)
                        .setScale(1, RoundingMode.HALF_UP);

        if (totalPayments > 0 && successRate.compareTo(new BigDecimal("85.0")) < 0) {
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "PRICE-1",
                    "PRICING",
                    "HIGH",
                    "Address payment conversion drop",
                    "Payment success rate is below target.",
                    "Review checkout friction and enable offer-based recovery prompts.",
                    "Success Rate",
                    successRate + "%"
            ));
        } else {
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "PRICE-1",
                    "PRICING",
                    "MEDIUM",
                    "Maintain pricing discipline on successful routes",
                    "Payment conversion is stable for current traffic.",
                    "Test incremental upsell bundles on top destinations.",
                    "Success Rate",
                    successRate + "%"
            ));
        }

        BigDecimal averageBookingValue = bookings.stream()
                .map(entry -> entry.getTotalAmount() != null ? entry.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (!bookings.isEmpty()) {
            averageBookingValue = averageBookingValue.divide(
                    BigDecimal.valueOf(bookings.size()),
                    0,
                    RoundingMode.HALF_UP
            );
        }

        recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                "PRICE-2",
                "PRICING",
                "INFO",
                "Track average booking value for package tuning",
                "Use current booking value baseline to optimize package tiers.",
                "Introduce value tiers around high-converting price points.",
                "Avg Booking Value",
                averageBookingValue.toPlainString()
        ));

        long pendingPaymentBookings = bookings.stream()
                .filter(entry -> entry.getStatus() == BookingStatus.PENDING_PAYMENT)
                .count();

        if (pendingPaymentBookings > 0) {
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "PRICE-3",
                    "PRICING",
                    "MEDIUM",
                    "Recover pending-payment bookings",
                    "Some bookings are waiting on payment completion.",
                    "Trigger limited-time discount reminders for pending payments.",
                    "Pending Payments",
                    String.valueOf(pendingPaymentBookings)
            ));
        }

        return recommendations;
    }

    private List<AdminRecommendationsResponse.RecommendationItemPayload> buildTimingRecommendations(
            List<BookingRequest> bookings
    ) {
        Map<Month, Long> bookingsByMonth = new HashMap<>();
        for (BookingRequest booking : bookings) {
            if (booking.getTravelDate() == null) {
                continue;
            }
            Month month = booking.getTravelDate().getMonth();
            bookingsByMonth.put(month, bookingsByMonth.getOrDefault(month, 0L) + 1L);
        }

        List<AdminRecommendationsResponse.RecommendationItemPayload> recommendations = new ArrayList<>();

        Month peakMonth = bookingsByMonth.entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (peakMonth != null) {
            long count = bookingsByMonth.getOrDefault(peakMonth, 0L);
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "TIME-1",
                    "TIMING",
                    "MEDIUM",
                    "Prepare capacity for " + toMonthName(peakMonth),
                    "Peak booking demand is concentrated in this month.",
                    "Increase staffing and inventory ahead of the peak window.",
                    "Peak Bookings",
                    String.valueOf(count)
            ));
        }

        LocalDate nextThirtyDays = LocalDate.now().plusDays(30);
        long nearTermTrips = bookings.stream()
                .filter(entry -> entry.getTravelDate() != null)
                .filter(entry -> !entry.getTravelDate().isBefore(LocalDate.now()) && !entry.getTravelDate().isAfter(nextThirtyDays))
                .count();

        recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                "TIME-2",
                "TIMING",
                nearTermTrips >= 5 ? "HIGH" : "INFO",
                "Optimize near-term campaign cadence",
                "Measure demand for trips starting in the next 30 days.",
                "Use weekly campaign pulses and faster approval cycles.",
                "Trips in 30 Days",
                String.valueOf(nearTermTrips)
        ));

        Month lowMonth = bookingsByMonth.entrySet()
                .stream()
                .min(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        if (lowMonth != null && peakMonth != null && lowMonth != peakMonth) {
            long count = bookingsByMonth.getOrDefault(lowMonth, 0L);
            recommendations.add(new AdminRecommendationsResponse.RecommendationItemPayload(
                    "TIME-3",
                    "TIMING",
                    "LOW",
                    "Boost off-season demand in " + toMonthName(lowMonth),
                    "This month currently has the lowest booking volume.",
                    "Run off-season offers and partner promotions to smooth demand.",
                    "Bookings",
                    String.valueOf(count)
            ));
        }

        return recommendations;
    }

    private String destinationKey(String destination, String country) {
        String normalizedDestination = destination == null ? "" : destination.trim().toLowerCase(Locale.ENGLISH);
        String normalizedCountry = country == null ? "" : country.trim().toLowerCase(Locale.ENGLISH);
        return normalizedDestination + "|" + normalizedCountry;
    }

    private String formatDestination(String destinationKey) {
        String[] parts = destinationKey.split("\\|", 2);
        String destination = toTitleCase(parts[0]);
        String country = parts.length > 1 ? toTitleCase(parts[1]) : "";
        if (country.isBlank()) {
            return destination;
        }
        return destination + ", " + country;
    }

    private String toTitleCase(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        String[] words = value.trim().split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < words.length; index++) {
            String word = words[index];
            if (index > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                builder.append(word.substring(1));
            }
        }
        return builder.toString();
    }

    private String toMonthName(Month month) {
        return month.getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }
}
