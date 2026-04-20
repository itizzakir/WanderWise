package com.wanderwise.wanderwise_backend.hotel;

import com.wanderwise.wanderwise_backend.hotel.dto.HotelResponse;
import com.wanderwise.wanderwise_backend.hotel.dto.UpsertHotelRequest;
import com.wanderwise.wanderwise_backend.tour.Tour;
import com.wanderwise.wanderwise_backend.tour.TourRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAllByOrderByDestinationAscPricePerNightAsc()
                .stream()
                .map(HotelResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> getSuggestedHotels(String destination, String country, int limit) {
        String normalizedDestination = normalizeOptional(destination);
        String normalizedCountry = normalizeOptional(country);
        int safeLimit = normalizeLimit(limit);

        if (normalizedDestination.isBlank() && normalizedCountry.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destination or country is required");
        }

        List<Hotel> matchedHotels = new ArrayList<>();
        if (!normalizedDestination.isBlank() && !normalizedCountry.isBlank()) {
            matchedHotels = hotelRepository.findTop40ByDestinationIgnoreCaseAndCountryIgnoreCaseOrderByPricePerNightAsc(
                    normalizedDestination,
                    normalizedCountry
            );
        }

        if (matchedHotels.isEmpty() && !normalizedDestination.isBlank()) {
            matchedHotels = hotelRepository.findTop40ByDestinationIgnoreCaseOrderByPricePerNightAsc(normalizedDestination);
        }

        if (matchedHotels.isEmpty() && !normalizedCountry.isBlank()) {
            matchedHotels = hotelRepository.findTop40ByCountryIgnoreCaseOrderByPricePerNightAsc(normalizedCountry);
        }

        if (matchedHotels.isEmpty()) {
            matchedHotels = hotelRepository.findAllByOrderByDestinationAscPricePerNightAsc();
        }

        return matchedHotels.stream()
                .limit(safeLimit)
                .map(HotelResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> getSuggestedHotelsByTourSlug(String tourSlug, int limit) {
        String normalizedTourSlug = normalizeOptional(tourSlug);
        if (normalizedTourSlug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tour slug is required");
        }

        Tour tour = tourRepository.findBySlug(normalizedTourSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        return getSuggestedHotels(tour.getDestination(), tour.getCountry(), limit);
    }

    @Transactional
    public HotelResponse createHotel(UpsertHotelRequest request) {
        Hotel hotel = new Hotel();
        String slug = Hotel.buildSlug(request.name(), request.destination(), request.country());
        if (hotelRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hotel with same name and location already exists");
        }

        applyRequest(hotel, request);
        hotel.setSlug(slug);
        return HotelResponse.fromEntity(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelResponse updateHotel(Long hotelId, UpsertHotelRequest request) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));

        String slug = Hotel.buildSlug(request.name(), request.destination(), request.country());
        if (hotelRepository.existsBySlugAndIdNot(slug, hotelId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hotel with same name and location already exists");
        }

        applyRequest(hotel, request);
        hotel.setSlug(slug);
        return HotelResponse.fromEntity(hotelRepository.save(hotel));
    }

    @Transactional
    public void deleteHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));
        hotelRepository.delete(hotel);
    }

    private void applyRequest(Hotel hotel, UpsertHotelRequest request) {
        hotel.setName(request.name());
        hotel.setDestination(request.destination());
        hotel.setCountry(request.country());
        hotel.setAddress(request.address());
        hotel.setPricePerNight(request.pricePerNight());
        hotel.setCurrency(request.currency());
        hotel.setRating(request.rating());
        hotel.setImg(request.img());
        hotel.setAmenities(request.amenities() != null ? new ArrayList<>(request.amenities()) : new ArrayList<>());
    }

    private String normalizeOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private int normalizeLimit(int limit) {
        if (limit < 1) {
            return 1;
        }

        return Math.min(limit, 20);
    }
}
