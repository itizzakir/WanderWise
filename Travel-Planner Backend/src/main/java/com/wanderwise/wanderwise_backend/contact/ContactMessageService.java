package com.wanderwise.wanderwise_backend.contact;

import com.wanderwise.wanderwise_backend.contact.dto.ContactMessageResponse;
import com.wanderwise.wanderwise_backend.contact.dto.CreateContactMessageRequest;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageResponse createMessage(CreateContactMessageRequest request) {
        ContactMessage contactMessage = ContactMessage.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim().toLowerCase())
                .subject(request.subject().trim())
                .message(request.message().trim())
                .read(false)
                .build();

        ContactMessage saved = contactMessageRepository.save(contactMessage);
        return ContactMessageResponse.fromEntity(saved);
    }

    @Transactional
    public List<ContactMessageResponse> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ContactMessageResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ContactMessageResponse markMessageRead(Long messageId) {
        ContactMessage contactMessage = getById(messageId);
        contactMessage.setRead(true);
        ContactMessage saved = contactMessageRepository.save(contactMessage);
        return ContactMessageResponse.fromEntity(saved);
    }

    @Transactional
    public List<ContactMessageResponse> markAllMessagesRead() {
        List<ContactMessage> messages = contactMessageRepository.findAllByOrderByCreatedAtDesc();

        boolean hasChanges = false;
        for (ContactMessage entry : messages) {
            if (!Boolean.TRUE.equals(entry.getRead())) {
                entry.setRead(true);
                hasChanges = true;
            }
        }

        List<ContactMessage> updated = hasChanges
                ? contactMessageRepository.saveAll(messages)
                : messages;

        return updated.stream()
                .map(ContactMessageResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        ContactMessage contactMessage = getById(messageId);
        contactMessageRepository.delete(contactMessage);
    }

    private ContactMessage getById(Long messageId) {
        return contactMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact message not found"));
    }
}
