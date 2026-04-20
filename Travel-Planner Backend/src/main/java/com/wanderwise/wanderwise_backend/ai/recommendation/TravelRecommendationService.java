package com.wanderwise.wanderwise_backend.ai.recommendation;

import com.wanderwise.wanderwise_backend.ai.client.AiClient;
import com.wanderwise.wanderwise_backend.ai.client.AiClientException;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationRequest;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationResponse;
import com.wanderwise.wanderwise_backend.ai.support.PromptTemplateLibrary;
import com.wanderwise.wanderwise_backend.ai.support.TravelDataSupportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelRecommendationService {

    private final TravelDataSupportService travelDataSupportService;
    private final PromptTemplateLibrary promptTemplateLibrary;
    private final AiClient aiClient;

    public RecommendationResponse recommend(RecommendationRequest request) {
        List<String> normalizedPreferences = request.preferences() == null
                ? List.of()
                : request.preferences().stream()
                        .filter(item -> item != null && !item.isBlank())
                        .map(String::trim)
                        .toList();

        TravelDataSupportService.RecommendationBundle bundle = travelDataSupportService.buildRecommendationBundle(
                request.destination(),
                request.budget(),
                request.numberOfDays(),
                normalizedPreferences
        );

        RecommendationResponse baseResponse = new RecommendationResponse(
                request.destination(),
                request.budget(),
                request.numberOfDays(),
                normalizedPreferences,
                buildDeterministicExplanation(request.destination(), bundle.hotels().size(), bundle.tours().size()),
                "database + ai explanation",
                false,
                bundle.hotels(),
                bundle.tours(),
                bundle.itinerary()
        );

        if (!aiClient.isAvailable()) {
            return baseResponse;
        }

        try {
            String explanation = aiClient.generateText(
                    promptTemplateLibrary.recommendationSystemPrompt(),
                    List.of(),
                    promptTemplateLibrary.recommendationUserPrompt(request, baseResponse)
            ).text();

            return new RecommendationResponse(
                    baseResponse.destination(),
                    baseResponse.budget(),
                    baseResponse.numberOfDays(),
                    baseResponse.preferences(),
                    explanation,
                    baseResponse.dataStrategy(),
                    true,
                    baseResponse.hotels(),
                    baseResponse.tours(),
                    baseResponse.suggestedItinerary()
            );
        } catch (AiClientException ex) {
            log.warn("Recommendation AI enhancement failed: {}", ex.getMessage());
            return baseResponse;
        }
    }

    private String buildDeterministicExplanation(String destination, int hotelCount, int tourCount) {
        return """
                This recommendation uses the local WanderWise travel database first.
                I found %s hotel option(s) and %s tour option(s) related to %s, then organized them into a practical trip plan.
                The selected matches balance destination fit, preference fit, and overall budget alignment.
                """.formatted(hotelCount, tourCount, destination).trim();
    }
}
