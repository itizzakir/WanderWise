package com.wanderwise.wanderwise_backend.contact;

import com.wanderwise.wanderwise_backend.contact.dto.ContactMessageResponse;
import com.wanderwise.wanderwise_backend.contact.dto.CreateContactMessageRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, String>> submitContactMessage(
            @Valid @RequestBody CreateContactMessageRequest request
    ) {
        contactMessageService.createMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Thank you. Your message has been sent to our admin team."));
    }

    @GetMapping("/api/admin/contact-messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactMessageResponse>> getAdminContactMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    @PatchMapping("/api/admin/contact-messages/{messageId}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactMessageResponse> markMessageRead(@PathVariable Long messageId) {
        return ResponseEntity.ok(contactMessageService.markMessageRead(messageId));
    }

    @PatchMapping("/api/admin/contact-messages/read-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactMessageResponse>> markAllMessagesRead() {
        return ResponseEntity.ok(contactMessageService.markAllMessagesRead());
    }

    @DeleteMapping("/api/admin/contact-messages/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        contactMessageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }
}
