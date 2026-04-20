package com.wanderwise.wanderwise_backend.ai.client;

import java.util.List;

public interface AiClient {

    boolean isAvailable();

    AiTextResult generateText(String systemPrompt, List<AiPromptMessage> conversationHistory, String userPrompt);

    record AiPromptMessage(String role, String content) {
    }

    record AiTextResult(String text, String model) {
    }
}
