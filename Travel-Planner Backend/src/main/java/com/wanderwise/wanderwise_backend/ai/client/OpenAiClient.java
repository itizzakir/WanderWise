package com.wanderwise.wanderwise_backend.ai.client;

import com.wanderwise.wanderwise_backend.ai.config.AiProperties;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
@Slf4j
public class OpenAiClient implements AiClient {

    private final AiProperties aiProperties;
    private final RestClient restClient;

    public OpenAiClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(20_000);
        requestFactory.setReadTimeout(60_000);

        this.restClient = RestClient.builder()
                .baseUrl(aiProperties.getBaseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public boolean isAvailable() {
        return aiProperties.isEnabled()
                && "openai".equalsIgnoreCase(aiProperties.getProvider())
                && aiProperties.getApiKey() != null
                && !aiProperties.getApiKey().isBlank();
    }

    @Override
    public AiTextResult generateText(String systemPrompt, List<AiPromptMessage> conversationHistory, String userPrompt) {
        if (!isAvailable()) {
            throw new AiClientException("OpenAI is not configured. Set app.ai.api-key or OPENAI_API_KEY.");
        }

        List<OpenAiMessage> messages = new ArrayList<>();
        messages.add(new OpenAiMessage("developer", systemPrompt));

        for (AiPromptMessage historyItem : conversationHistory) {
            if (historyItem == null || historyItem.content() == null || historyItem.content().isBlank()) {
                continue;
            }
            messages.add(new OpenAiMessage(historyItem.role(), historyItem.content()));
        }

        messages.add(new OpenAiMessage("user", userPrompt));

        OpenAiChatCompletionRequest request = new OpenAiChatCompletionRequest(
                aiProperties.getModel(),
                messages,
                aiProperties.getTemperature()
        );

        try {
            OpenAiChatCompletionResponse response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(aiProperties.getApiKey()))
                    .body(request)
                    .retrieve()
                    .body(OpenAiChatCompletionResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new AiClientException("OpenAI returned an empty response.");
            }

            OpenAiChatCompletionResponse.OpenAiChoice firstChoice = response.choices().get(0);
            if (firstChoice.message() == null || firstChoice.message().content() == null
                    || firstChoice.message().content().isBlank()) {
                throw new AiClientException("OpenAI returned an empty assistant message.");
            }

            return new AiTextResult(firstChoice.message().content().trim(), response.model());
        } catch (RestClientResponseException ex) {
            log.error("OpenAI API request failed: status={} body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new AiClientException("OpenAI request failed with status " + ex.getStatusCode().value(), ex);
        } catch (Exception ex) {
            log.error("OpenAI client error", ex);
            throw new AiClientException("Unable to call OpenAI API", ex);
        }
    }

    private record OpenAiChatCompletionRequest(
            String model,
            List<OpenAiMessage> messages,
            double temperature
    ) {
    }

    private record OpenAiMessage(
            String role,
            String content
    ) {
    }

    private record OpenAiChatCompletionResponse(
            String model,
            List<OpenAiChoice> choices
    ) {
        private record OpenAiChoice(OpenAiMessageResponse message) {
        }

        private record OpenAiMessageResponse(String content) {
        }
    }
}
