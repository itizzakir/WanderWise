package com.wanderwise.wanderwise_backend.ai.support;

import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationRequest;
import com.wanderwise.wanderwise_backend.ai.recommendation.dto.RecommendationResponse;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeRequest;
import com.wanderwise.wanderwise_backend.ai.travelmode.dto.TravelModeResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PromptTemplateLibrary {

    public String chatbotSystemPrompt() {
        return """
                You are WanderWise AI, a practical travel assistant.
                Prefer the database facts provided by the application.
                When database context is present, answer using those facts first and keep the reply concise, warm, and helpful.
                If the database has no useful match, answer as a general travel assistant without inventing fake hotel or tour records.
                """;
    }

    public String chatbotUserPrompt(String userMessage, TravelDataSupportService.TravelKnowledgeContext knowledgeContext) {
        return """
                USER QUESTION:
                %s

                DATABASE CONTEXT:
                %s

                RESPONSE RULES:
                1. Mention matching hotels and tours only if they are included in the database context.
                2. If no database match exists, answer as a general AI assistant and clearly say the reply is based on general travel knowledge.
                3. Keep the answer under 180 words.
                """.formatted(userMessage, knowledgeContext.toPromptBlock());
    }

    public String recommendationSystemPrompt() {
        return """
                You are an AI travel planner.
                Turn structured hotel and tour matches into a short explanation that helps a traveler understand why the plan fits their budget and preferences.
                Do not invent hotels or tours that are not listed in the supplied context.
                """;
    }

    public String recommendationUserPrompt(
            RecommendationRequest request,
            RecommendationResponse response
    ) {
        return """
                TRAVEL REQUEST:
                Destination: %s
                Budget: %s
                Days: %s
                Preferences: %s

                MATCHED HOTELS:
                %s

                MATCHED TOURS:
                %s

                ITINERARY:
                %s

                Write a clear explanation in 3 to 5 sentences.
                Mention budget fit, preference fit, and one practical planning tip.
                """.formatted(
                request.destination(),
                formatMoney(request.budget()),
                request.numberOfDays(),
                joinList(request.preferences()),
                response.hotels().stream()
                        .map(item -> "%s in %s, %s at %s/night (%s)"
                                .formatted(item.name(), item.destination(), item.country(), formatMoney(item.pricePerNight()), item.matchReason()))
                        .collect(Collectors.joining("\n")),
                response.tours().stream()
                        .map(item -> "%s, %s - %s days - %s"
                                .formatted(item.destination(), item.country(), item.duration(), item.matchReason()))
                        .collect(Collectors.joining("\n")),
                String.join("\n", response.suggestedItinerary())
        );
    }

    public String travelModeSystemPrompt() {
        return """
                You are a travel operations assistant.
                Explain a transport recommendation in a grounded, concise way.
                Use the scored transport options from the app and avoid adding made-up pricing.
                """;
    }

    public String travelModeUserPrompt(TravelModeRequest request, TravelModeResponse response) {
        return """
                TRAVEL MODE REQUEST:
                Origin: %s
                Destination: %s
                Distance: %s km
                Budget: %s
                Available Time: %s hours

                RECOMMENDED MODE:
                %s

                SCORED OPTIONS:
                %s

                Write a short explanation in 2 to 4 sentences.
                Mention why the top mode fits the budget and time best, and name one backup option.
                """.formatted(
                request.origin(),
                request.destination(),
                request.distanceKm(),
                formatMoney(request.budget()),
                request.availableHours(),
                response.recommendedMode(),
                response.options().stream()
                        .map(item -> "%s: score=%s, cost=%s, time=%s hours"
                                .formatted(item.mode(), item.suitabilityScore(), formatMoney(item.estimatedCost()), item.estimatedHours()))
                        .collect(Collectors.joining("\n"))
        );
    }

    private String joinList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "None";
        }

        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.joining(", "));
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) {
            return "Not provided";
        }
        return "INR " + amount.stripTrailingZeros().toPlainString();
    }
}
