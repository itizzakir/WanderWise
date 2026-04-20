package com.wanderwise.wanderwise_backend.ai.travelmode;

import com.wanderwise.wanderwise_backend.ai.client.AiClient;
import com.wanderwise.wanderwise_backend.ai.client.AiClientException;
import com.wanderwise.wanderwise_backend.ai.support.PromptTemplateLibrary;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeOptionDto;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeRequest;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelModeService {

    private final AiClient aiClient;
    private final PromptTemplateLibrary promptTemplateLibrary;

    public TravelModeResponse suggestMode(TravelModeRequest request) {
        List<TravelModeOptionDto> options = List.of(
                buildOption("Flight", request.distanceKm(), request.budget(), request.availableHours(), 4.8, 700.0, 2.0),
                buildOption("Train", request.distanceKm(), request.budget(), request.availableHours(), 2.1, 95.0, 1.0),
                buildOption("Bus", request.distanceKm(), request.budget(), request.availableHours(), 1.4, 60.0, 1.2),
                buildOption("Car", request.distanceKm(), request.budget(), request.availableHours(), 2.8, 70.0, 0.8)
        ).stream()
                .sorted(Comparator.comparingInt(TravelModeOptionDto::suitabilityScore).reversed())
                .toList();

        TravelModeOptionDto bestOption = options.get(0);
        TravelModeResponse response = new TravelModeResponse(
                bestOption.mode(),
                buildFallbackReason(bestOption, options),
                false,
                options
        );

        if (!aiClient.isAvailable()) {
            return response;
        }

        try {
            String aiReason = aiClient.generateText(
                    promptTemplateLibrary.travelModeSystemPrompt(),
                    List.of(),
                    promptTemplateLibrary.travelModeUserPrompt(request, response)
            ).text();

            return new TravelModeResponse(
                    response.recommendedMode(),
                    aiReason,
                    true,
                    response.options()
            );
        } catch (AiClientException ex) {
            log.warn("Travel mode AI enhancement failed: {}", ex.getMessage());
            return response;
        }
    }

    private TravelModeOptionDto buildOption(
            String mode,
            int distanceKm,
            BigDecimal budget,
            double availableHours,
            double costPerKm,
            double averageSpeedKmPerHour,
            double fixedHours
    ) {
        BigDecimal estimatedCost = BigDecimal.valueOf(distanceKm)
                .multiply(BigDecimal.valueOf(costPerKm))
                .add(baseCostForMode(mode))
                .setScale(0, RoundingMode.HALF_UP);

        double estimatedHours = Math.round(((distanceKm / averageSpeedKmPerHour) + fixedHours) * 10.0) / 10.0;
        int score = 50;

        if (estimatedCost.compareTo(budget) <= 0) {
            score += 18;
        } else if (estimatedCost.compareTo(budget.multiply(new BigDecimal("1.20"))) <= 0) {
            score += 6;
        } else {
            score -= 18;
        }

        if (estimatedHours <= availableHours) {
            score += 18;
        } else if (estimatedHours <= availableHours * 1.25) {
            score += 4;
        } else {
            score -= 20;
        }

        if ("Flight".equals(mode) && distanceKm >= 900) {
            score += 10;
        }
        if ("Train".equals(mode) && distanceKm >= 250 && distanceKm <= 900) {
            score += 10;
        }
        if ("Bus".equals(mode) && distanceKm <= 350) {
            score += 10;
        }
        if ("Car".equals(mode) && distanceKm <= 500) {
            score += 8;
        }

        return new TravelModeOptionDto(
                mode,
                estimatedCost,
                estimatedHours,
                score,
                buildOptionReason(mode, estimatedCost, estimatedHours, budget, availableHours)
        );
    }

    private BigDecimal baseCostForMode(String mode) {
        return switch (mode) {
            case "Flight" -> new BigDecimal("2200");
            case "Train" -> new BigDecimal("500");
            case "Bus" -> new BigDecimal("350");
            default -> new BigDecimal("700");
        };
    }

    private String buildOptionReason(
            String mode,
            BigDecimal estimatedCost,
            double estimatedHours,
            BigDecimal budget,
            double availableHours
    ) {
        return "%s is estimated at INR %s and about %.1f hour(s), compared with your INR %s budget and %.1f available hour(s)."
                .formatted(
                        mode,
                        estimatedCost.toPlainString(),
                        estimatedHours,
                        budget.stripTrailingZeros().toPlainString(),
                        availableHours
                );
    }

    private String buildFallbackReason(TravelModeOptionDto bestOption, List<TravelModeOptionDto> options) {
        String backupMode = options.size() > 1 ? options.get(1).mode() : bestOption.mode();
        return """
                %s is the best fit because it offers the strongest balance of travel time and budget for this route.
                It is estimated at INR %s and about %.1f hours.
                If you want a backup option, %s is the next best choice.
                """.formatted(
                bestOption.mode(),
                bestOption.estimatedCost().toPlainString(),
                bestOption.estimatedHours(),
                backupMode
        ).trim();
    }
}
