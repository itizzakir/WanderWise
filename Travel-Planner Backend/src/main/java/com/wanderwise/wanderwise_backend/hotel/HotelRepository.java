package com.wanderwise.wanderwise_backend.hotel;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findAllByOrderByDestinationAscPricePerNightAsc();

    List<Hotel> findTop40ByDestinationIgnoreCaseAndCountryIgnoreCaseOrderByPricePerNightAsc(
            String destination,
            String country
    );

    List<Hotel> findTop40ByDestinationIgnoreCaseOrderByPricePerNightAsc(String destination);

    List<Hotel> findTop40ByCountryIgnoreCaseOrderByPricePerNightAsc(String country);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
