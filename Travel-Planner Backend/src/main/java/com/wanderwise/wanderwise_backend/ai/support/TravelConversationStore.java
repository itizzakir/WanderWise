package com.wanderwise.wanderwise_backend.ai.support;

import com.wanderwise.wanderwise_backend.ai.config.AiProperties;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class TravelConversationStore {

    private final Map<String, ConversationState> conversations = new ConcurrentHashMap<>();
    private final int maxConversationMessages;

    public TravelConversationStore(AiProperties aiProperties) {
        this.maxConversationMessages = Math.max(4, aiProperties.getMaxConversationMessages());
    }

    public String resolveConversationId(String conversationId) {
        String normalized = conversationId == null ? "" : conversationId.trim();
        return normalized.isBlank() ? UUID.randomUUID().toString() : normalized;
    }

    public ConversationSnapshot getSnapshot(String conversationId) {
        ConversationState state = conversations.computeIfAbsent(conversationId, key -> new ConversationState());
        return state.snapshot();
    }

    public void appendUserMessage(String conversationId, String message) {
        append(conversationId, "user", message);
    }

    public void appendAssistantMessage(String conversationId, String message) {
        append(conversationId, "assistant", message);
    }

    public void rememberLocation(String conversationId, String destination, String country) {
        ConversationState state = conversations.computeIfAbsent(conversationId, key -> new ConversationState());
        state.rememberLocation(destination, country);
    }

    private void append(String conversationId, String role, String message) {
        ConversationState state = conversations.computeIfAbsent(conversationId, key -> new ConversationState());
        state.append(role, message, maxConversationMessages);
    }

    private static final class ConversationState {

        private final Deque<ConversationTurn> history = new ArrayDeque<>();
        private String lastDestination;
        private String lastCountry;

        private synchronized void append(String role, String message, int maxConversationMessages) {
            if (message == null || message.isBlank()) {
                return;
            }

            history.addLast(new ConversationTurn(role, message.trim(), Instant.now()));
            while (history.size() > maxConversationMessages * 2) {
                history.removeFirst();
            }
        }

        private synchronized void rememberLocation(String destination, String country) {
            if (destination != null && !destination.isBlank()) {
                this.lastDestination = destination.trim();
            }
            if (country != null && !country.isBlank()) {
                this.lastCountry = country.trim();
            }
        }

        private synchronized ConversationSnapshot snapshot() {
            return new ConversationSnapshot(
                    new ArrayList<>(history),
                    lastDestination,
                    lastCountry
            );
        }
    }

    public record ConversationSnapshot(
            List<ConversationTurn> history,
            String lastDestination,
            String lastCountry
    ) {
    }

    public record ConversationTurn(
            String role,
            String content,
            Instant timestamp
    ) {
    }
}
