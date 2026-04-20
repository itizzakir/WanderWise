package com.wanderwise.wanderwise_backend.tour;

import com.wanderwise.wanderwise_backend.tour.dto.TourResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourResponse>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllTours());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<TourResponse> getTourBySlug(@PathVariable String slug) {
        TourResponse response = tourService.getTourBySlug(slug);
        if (response == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        return ResponseEntity.ok(response);
    }
}
