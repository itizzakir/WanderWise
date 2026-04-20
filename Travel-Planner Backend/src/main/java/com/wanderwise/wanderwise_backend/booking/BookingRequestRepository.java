package com.wanderwise.wanderwise_backend.booking;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRequestRepository extends JpaRepository<BookingRequest, Long> {
    boolean existsByBookingCode(String bookingCode);

    List<BookingRequest> findAllByOrderByRequestedAtDesc();

    List<BookingRequest> findAllByUserEmailOrderByRequestedAtDesc(String userEmail);

    Optional<BookingRequest> findByIdAndUserEmail(Long id, String userEmail);
}
