package com.wanderwise.wanderwise_backend.admin.dashboard;

import com.wanderwise.wanderwise_backend.admin.dashboard.dto.AdminDashboardOverviewResponse;
import com.wanderwise.wanderwise_backend.booking.BookingRequest;
import com.wanderwise.wanderwise_backend.booking.BookingRequestRepository;
import com.wanderwise.wanderwise_backend.booking.BookingStatus;
import com.wanderwise.wanderwise_backend.payment.PaymentRecord;
import com.wanderwise.wanderwise_backend.payment.PaymentRecordRepository;
import com.wanderwise.wanderwise_backend.payment.PaymentStatus;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import com.wanderwise.wanderwise_backend.user.UserStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final BigDecimal DEFAULT_BUDGET_TARGET = new BigDecimal("2400000");
    private static final String FALLBACK_IMAGE_URL =
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60";

    private final UserRepository userRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public AdminDashboardOverviewResponse getOverview() {
        List<User> users = userRepository.findAllByOrderByIdAsc();
        List<BookingRequest> bookings = bookingRequestRepository.findAllByOrderByRequestedAtDesc();
        List<PaymentRecord> payments = paymentRecordRepository.findAllByOrderByPaidAtDesc();
        List<Tour> tours = tourRepository.findAllByOrderByDestinationAsc();

        return new AdminDashboardOverviewResponse(
                buildTotals(users, bookings, payments),
                buildBookingOverview(bookings),
                buildUsers(users),
                buildRecentBookings(bookings),
                buildBudget(payments),
                buildSystemAlerts(users, bookings, payments),
                buildPopularDestinations(bookings, tours)
        );
    }

    private AdminDashboardOverviewResponse.TotalsPayload buildTotals(
            List<User> users,
            List<BookingRequest> bookings,
            List<PaymentRecord> payments
    ) {
        long activeTrips = bookings.stream()
                .filter(entry -> entry.getStatus() == BookingStatus.PENDING || entry.getStatus() == BookingStatus.APPROVED)
                .filter(entry -> entry.getTravelDate() != null && !entry.getTravelDate().isBefore(LocalDate.now()))
                .count();

        BigDecimal totalRevenue = payments.stream()
                .filter(entry -> entry.getStatus() == PaymentStatus.SUCCESS)
                .map(entry -> entry.getAmount() != null ? entry.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminDashboardOverviewResponse.TotalsPayload(
                (long) users.size(),
                activeTrips,
                (long) bookings.size(),
                totalRevenue
        );
    }

    private List<AdminDashboardOverviewResponse.BookingOverviewPoint> buildBookingOverview(List<BookingRequest> bookings) {
        Map<YearMonth, Long> monthlyCounts = bookings.stream()
                .filter(entry -> entry.getRequestedAt() != null)
                .collect(Collectors.groupingBy(
                        entry -> YearMonth.from(entry.getRequestedAt()),
                        Collectors.counting()
                ));

        YearMonth currentMonth = YearMonth.now();
        return java.util.stream.IntStream.rangeClosed(0, 11)
                .mapToObj(offset -> currentMonth.minusMonths(11L - offset))
                .map(month -> new AdminDashboardOverviewResponse.BookingOverviewPoint(
                        month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                        monthlyCounts.getOrDefault(month, 0L)
                ))
                .toList();
    }

    private List<AdminDashboardOverviewResponse.UserRowPayload> buildUsers(List<User> users) {
        int fromIndex = Math.max(0, users.size() - 5);
        List<AdminDashboardOverviewResponse.UserRowPayload> rows = new ArrayList<>(5);

        for (int index = users.size() - 1; index >= fromIndex; index--) {
            User user = users.get(index);
            String email = user.getEmail() != null ? user.getEmail() : "";
            UserStatus status = user.getStatus() != null ? user.getStatus() : UserStatus.ACTIVE;

            rows.add(new AdminDashboardOverviewResponse.UserRowPayload(
                    user.getId(),
                    user.getName(),
                    email,
                    status.name(),
                    "https://i.pravatar.cc/150?u=" + email
            ));
        }

        return rows;
    }

    private List<AdminDashboardOverviewResponse.RecentBookingPayload> buildRecentBookings(List<BookingRequest> bookings) {
        return bookings.stream()
                .limit(5)
                .map(entry -> new AdminDashboardOverviewResponse.RecentBookingPayload(
                        entry.getId(),
                        entry.getBookingCode(),
                        entry.getTravelerName(),
                        entry.getStatus().name()
                ))
                .toList();
    }

    private AdminDashboardOverviewResponse.BudgetPayload buildBudget(List<PaymentRecord> payments) {
        BigDecimal spent = payments.stream()
                .filter(entry -> entry.getStatus() == PaymentStatus.SUCCESS)
                .map(entry -> entry.getAmount() != null ? entry.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = DEFAULT_BUDGET_TARGET.subtract(spent);
        if (remaining.signum() < 0) {
            remaining = BigDecimal.ZERO;
        }

        return new AdminDashboardOverviewResponse.BudgetPayload(spent, DEFAULT_BUDGET_TARGET, remaining);
    }

    private List<AdminDashboardOverviewResponse.SystemAlertPayload> buildSystemAlerts(
            List<User> users,
            List<BookingRequest> bookings,
            List<PaymentRecord> payments
    ) {
        long pendingApprovals = bookings.stream()
                .filter(entry -> entry.getStatus() == BookingStatus.PENDING)
                .count();
        long pendingPayments = bookings.stream()
                .filter(entry -> entry.getStatus() == BookingStatus.PENDING_PAYMENT)
                .count();
        long failedPayments = payments.stream()
                .filter(entry -> entry.getStatus() == PaymentStatus.FAILED)
                .count();
        long suspendedUsers = users.stream()
                .filter(entry -> entry.getStatus() == UserStatus.SUSPENDED)
                .count();

        java.util.ArrayList<AdminDashboardOverviewResponse.SystemAlertPayload> alerts = new java.util.ArrayList<>();
        if (failedPayments > 0) {
            alerts.add(new AdminDashboardOverviewResponse.SystemAlertPayload(
                    "HIGH",
                    failedPayments + " failed payment(s)",
                    "Investigate failed transactions and verify gateway logs."
            ));
        }

        if (pendingApprovals > 0) {
            alerts.add(new AdminDashboardOverviewResponse.SystemAlertPayload(
                    "MEDIUM",
                    pendingApprovals + " booking(s) pending approval",
                    "Review pending traveler booking requests."
            ));
        }

        if (pendingPayments > 0) {
            alerts.add(new AdminDashboardOverviewResponse.SystemAlertPayload(
                    "MEDIUM",
                    pendingPayments + " booking(s) awaiting payment",
                    "Travelers have pending payments to complete."
            ));
        }

        if (suspendedUsers > 0) {
            alerts.add(new AdminDashboardOverviewResponse.SystemAlertPayload(
                    "INFO",
                    suspendedUsers + " suspended user account(s)",
                    "Check account moderation and reactivation requests."
            ));
        }

        if (alerts.isEmpty()) {
            alerts.add(new AdminDashboardOverviewResponse.SystemAlertPayload(
                    "INFO",
                    "All systems operational",
                    "No high priority alerts at the moment."
            ));
        }

        return alerts.stream().limit(3).toList();
    }

    private List<AdminDashboardOverviewResponse.PopularDestinationPayload> buildPopularDestinations(
            List<BookingRequest> bookings,
            List<Tour> tours
    ) {
        Map<String, Long> counts = bookings.stream()
                .filter(entry -> entry.getDestination() != null && entry.getCountry() != null)
                .collect(Collectors.groupingBy(
                        entry -> (entry.getDestination().trim() + "|" + entry.getCountry().trim()).toLowerCase(Locale.ENGLISH),
                        Collectors.counting()
                ));

        Map<String, String> imageByKey = new HashMap<>();
        for (Tour tour : tours) {
            if (tour.getDestination() == null || tour.getCountry() == null) {
                continue;
            }
            String key = (tour.getDestination().trim() + "|" + tour.getCountry().trim()).toLowerCase(Locale.ENGLISH);
            String image = Optional.ofNullable(tour.getImg())
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .orElse(FALLBACK_IMAGE_URL);
            imageByKey.put(key, image);
        }

        return counts.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|", 2);
                    String destination = parts[0];
                    String country = parts.length > 1 ? parts[1] : "";

                    return new AdminDashboardOverviewResponse.PopularDestinationPayload(
                            toTitleCase(destination),
                            toTitleCase(country),
                            imageByKey.getOrDefault(entry.getKey(), FALLBACK_IMAGE_URL),
                            entry.getValue()
                    );
                })
                .toList();
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
}
