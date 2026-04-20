package com.wanderwise.wanderwise_backend.contact.dto;

import com.wanderwise.wanderwise_backend.contact.ContactMessage;

public record ContactMessageResponse(
        Long messageId,
        String id,
        String fullName,
        String email,
        String subject,
        String message,
        Boolean read,
        String createdAt
) {
    public static ContactMessageResponse fromEntity(ContactMessage contactMessage) {
        Long messageId = contactMessage.getId();
        return new ContactMessageResponse(
                messageId,
                "CNT-" + messageId,
                contactMessage.getFullName(),
                contactMessage.getEmail(),
                contactMessage.getSubject(),
                contactMessage.getMessage(),
                contactMessage.getRead(),
                contactMessage.getCreatedAt().toString()
        );
    }
}
