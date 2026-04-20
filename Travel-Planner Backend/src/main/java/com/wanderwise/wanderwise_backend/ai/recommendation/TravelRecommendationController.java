package com.wanderwise.wanderwise_backend.ai.recommendation;

import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationRequest;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class TravelRecommendationController {

    private final TravelRecommendationService travelRecommendationService;

    @PostMapping
    public ResponseEntity<RecommendationResponse> recommend(@Valid @RequestBody RecommendationRequest request) {
        return ResponseEntity.ok(travelRecommendationService.recommend(request));
    }
}
