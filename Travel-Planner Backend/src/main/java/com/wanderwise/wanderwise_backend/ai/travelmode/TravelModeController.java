package com.wanderwise.wanderwise_backend.ai.travelmode;

import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeRequest;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/travel-mode")
@RequiredArgsConstructor
public class TravelModeController {

    private final TravelModeService travelModeService;

    @PostMapping
    public ResponseEntity<TravelModeResponse> suggestMode(@Valid @RequestBody TravelModeRequest request) {
        return ResponseEntity.ok(travelModeService.suggestMode(request));
    }
}
