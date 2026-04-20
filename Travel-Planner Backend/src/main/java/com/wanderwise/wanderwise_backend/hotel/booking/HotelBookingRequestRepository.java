package com.wanderwise.wanderwise_backend.hotel.booking;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelBookingRequestRepository extends JpaRepository<HotelBookingRequest, Long> {
    boolean existsByBookingCode(String bookingCode);

    List<HotelBookingRequest> findAllByOrderByRequestedAtDesc();

    List<HotelBookingRequest> findAllByUserEmailOrderByRequestedAtDesc(String userEmail);

    Optional<HotelBookingRequest> findByIdAndUserEmail(Long id, String userEmail);
}
