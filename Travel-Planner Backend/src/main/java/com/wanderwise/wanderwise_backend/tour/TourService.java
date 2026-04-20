package com.wanderwise.wanderwise_backend.tour;

import com.wanderwise.wanderwise_backend.tour.dto.TourResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;

    @Transactional(readOnly = true)
    public List<TourResponse> getAllTours() {
        return tourRepository.findAllByOrderByDestinationAsc()
                .stream()
                .map(TourResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TourResponse getTourBySlug(String slug) {
        return tourRepository.findBySlug(slug)
                .map(TourResponse::fromEntity)
                .orElse(null);
    }

    @Transactional
    public void deleteTourById(Long tourId) {
        if (tourId == null || !tourRepository.existsById(tourId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        tourRepository.deleteById(tourId);
    }
}
