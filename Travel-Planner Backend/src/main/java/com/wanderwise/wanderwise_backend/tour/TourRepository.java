package com.wanderwise.wanderwise_backend.tour;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findAllByOrderByDestinationAsc();

    List<Tour> findTop3ByOrderByDestinationAsc();

    Optional<Tour> findBySlug(String slug);

    Optional<Tour> findByDestinationIgnoreCaseAndCountryIgnoreCase(String destination, String country);
}
