package com.wanderwise.wanderwise_backend.ai.chat;

import com.wanderwise.wanderwise_backend.ai.chat.dto.ChatMessageDto;
import com.wanderwise.wanderwise_backend.ai.chat.dto.ChatRequest;
import com.wanderwise.wanderwise_backend.ai.chat.dto.ChatResponse;
import com.wanderwise.wanderwise_backend.ai.client.AiClient;
import com.wanderwise.wanderwise_backend.ai.client.AiClientException;
import com.wanderwise.wanderwise_backend.ai.support.PromptTemplateLibrary;
import com.wanderwise.wanderwise_backend.ai.support.TravelConversationStore;
import com.wanderwise.wanderwise_backend.ai.support.TravelDataSupportService;
import com.wanderwise.wanderwise_backend.hotel.Hotel;
import com.wanderwise.wanderwise_backend.tour.Tour;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private static final List<String> HOTEL_KEYWORDS = List.of("hotel", "stay", "resort", "room", "accommodation");
    private static final List<String> TOUR_KEYWORDS = List.of("tour", "itinerary", "activity", "activities", "plan", "sightseeing");

    private final AiClient aiClient;
    private final PromptTemplateLibrary promptTemplateLibrary;
    private final TravelDataSupportService travelDataSupportService;
    private final TravelConversationStore travelConversationStore;

    public ChatResponse chat(ChatRequest request) {
        String conversationId = travelConversationStore.resolveConversationId(request.conversationId());
        TravelConversationStore.ConversationSnapshot snapshot = travelConversationStore.getSnapshot(conversationId);
        String normalizedMessage = normalize(request.message());

        boolean wantsHotels = containsKeyword(normalizedMessage, HOTEL_KEYWORDS);
        boolean wantsTours = containsKeyword(normalizedMessage, TOUR_KEYWORDS);

        if (!wantsHotels && !wantsTours) {
            wantsHotels = normalizedMessage.contains("travel");
            wantsTours = normalizedMessage.contains("travel") || normalizedMessage.contains("trip");
        }

        TravelDataSupportService.TravelKnowledgeContext knowledgeContext = travelDataSupportService.findKnowledgeForChat(
                request.message(),
                wantsHotels,
                wantsTours,
                snapshot
        );

        travelConversationStore.appendUserMessage(conversationId, request.message());

        String answer;
        boolean aiEnhanced = false;
        if (knowledgeContext.hasMatches()) {
            answer = buildDatabaseSummary(knowledgeContext);
            if (aiClient.isAvailable()) {
                try {
                    List<AiClient.AiPromptMessage> history = snapshot.history().stream()
                            .map(item -> new AiClient.AiPromptMessage(item.role(), item.content()))
                            .toList();

                    answer = aiClient.generateText(
                            promptTemplateLibrary.chatbotSystemPrompt(),
                            history,
                            promptTemplateLibrary.chatbotUserPrompt(request.message(), knowledgeContext)
                    ).text();
                    aiEnhanced = true;
                } catch (AiClientException ex) {
                    log.warn("AI enhancement failed for chat, using database summary instead: {}", ex.getMessage());
                }
            }
        } else {
            answer = """
                    I could not find matching hotels or tours in the local database for that request.
                    """.trim();

            if (aiClient.isAvailable()) {
                try {
                    List<AiClient.AiPromptMessage> history = snapshot.history().stream()
                            .map(item -> new AiClient.AiPromptMessage(item.role(), item.content()))
                            .toList();

                    answer = aiClient.generateText(
                            promptTemplateLibrary.chatbotSystemPrompt(),
                            history,
                            promptTemplateLibrary.chatbotUserPrompt(request.message(), knowledgeContext)
                    ).text();
                    aiEnhanced = true;
                } catch (AiClientException ex) {
                    log.warn("AI fallback failed for chat: {}", ex.getMessage());
                    answer = answer + " AI fallback is not configured right now.";
                }
            } else {
                answer = answer + " AI fallback is not configured right now.";
            }
        }

        travelConversationStore.appendAssistantMessage(conversationId, answer);
        travelConversationStore.rememberLocation(
                conversationId,
                knowledgeContext.matchedDestination(),
                knowledgeContext.matchedCountry()
        );

        TravelConversationStore.ConversationSnapshot updatedSnapshot = travelConversationStore.getSnapshot(conversationId);
        return new ChatResponse(
                conversationId,
                answer,
                knowledgeContext.hasMatches(),
                aiEnhanced,
                knowledgeContext.matchedDestination(),
                knowledgeContext.matchedCountry(),
                mapHotels(knowledgeContext.hotels()),
                mapTours(knowledgeContext.tours()),
                updatedSnapshot.history().stream()
                        .map(item -> new ChatMessageDto(item.role(), item.content(), item.timestamp().toString()))
                        .toList()
        );
    }

    private List<ChatResponse.ChatHotelDto> mapHotels(List<Hotel> hotels) {
        return hotels.stream()
                .map(hotel -> new ChatResponse.ChatHotelDto(
                        hotel.getId(),
                        hotel.getName(),
                        hotel.getDestination(),
                        hotel.getCountry(),
                        hotel.getAddress(),
                        hotel.getPricePerNight().toPlainString(),
                        hotel.getCurrency(),
                        hotel.getRating().toPlainString(),
                        hotel.getAmenities()
                ))
                .toList();
    }

    private List<ChatResponse.ChatTourDto> mapTours(List<Tour> tours) {
        return tours.stream()
                .map(tour -> new ChatResponse.ChatTourDto(
                        tour.getId(),
                        tour.getDestination(),
                        tour.getCountry(),
                        tour.getCategory(),
                        tour.getDuration(),
                        tour.getDescription(),
                        tour.getPlan()
                ))
                .toList();
    }

    private String buildDatabaseSummary(TravelDataSupportService.TravelKnowledgeContext knowledgeContext) {
        StringBuilder builder = new StringBuilder();

        if (!knowledgeContext.hotels().isEmpty()) {
            builder.append("I found ")
                    .append(knowledgeContext.hotels().size())
                    .append(" hotel option(s) in the database. ");

            Hotel firstHotel = knowledgeContext.hotels().get(0);
            builder.append(firstHotel.getName())
                    .append(" is in ")
                    .append(firstHotel.getDestination())
                    .append(", ")
                    .append(firstHotel.getCountry())
                    .append(" and starts at ")
                    .append(firstHotel.getCurrency())
                    .append(" ")
                    .append(firstHotel.getPricePerNight().stripTrailingZeros().toPlainString())
                    .append(" per night. ");
        }

        if (!knowledgeContext.tours().isEmpty()) {
            Tour firstTour = knowledgeContext.tours().get(0);
            builder.append("I also found ")
                    .append(knowledgeContext.tours().size())
                    .append(" tour plan(s). ")
                    .append("A strong option is the ")
                    .append(firstTour.getCategory())
                    .append(" tour for ")
                    .append(firstTour.getDestination())
                    .append(", which runs for ")
                    .append(firstTour.getDuration())
                    .append(" day(s).");
        }

        return builder.toString().trim();
    }

    private boolean containsKeyword(String input, List<String> keywords) {
        return keywords.stream().anyMatch(input::contains);
    }

    private String normalize(String value) {
        return value == null
                ? ""
                : value.toLowerCase(Locale.ENGLISH).replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }
}
