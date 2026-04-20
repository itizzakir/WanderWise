package com.wanderwise.wanderwise_backend.user;

import com.wanderwise.wanderwise_backend.notification.TravelerNotificationService;
import com.wanderwise.wanderwise_backend.notification.TravelerNotificationType;
import com.wanderwise.wanderwise_backend.user.dto.UpdateNotificationSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UpdatePreferenceSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UpdateProfileSettingsRequest;
import com.wanderwise.wanderwise_backend.user.dto.UserSettingsResponse;
import jakarta.transaction.Transactional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private static final String DEFAULT_LANGUAGE = "English";
    private static final String DEFAULT_CURRENCY = "INR";
    private static final String DEFAULT_TIME_FORMAT = "12_HOUR";
    private static final String DEFAULT_TIME_ZONE = "Asia/Kolkata";
    private static final Set<String> SUPPORTED_TIME_FORMATS = Set.of("12_HOUR", "24_HOUR");

    private final UserRepository userRepository;
    private final TravelerNotificationService travelerNotificationService;

    @Transactional
    public UserSettingsResponse getCurrentUserSettings(String userEmail) {
        User user = getUserOrThrow(userEmail);
        if (applyDefaults(user)) {
            user = userRepository.save(user);
        }
        return UserSettingsResponse.fromUser(user);
    }

    @Transactional
    public UserSettingsResponse updateProfile(String userEmail, UpdateProfileSettingsRequest request) {
        User user = getUserOrThrow(userEmail);
        applyDefaults(user);

        user.setName(request.name().trim());
        user.setMobileNumber(request.mobileNumber().trim());

        User savedUser = userRepository.save(user);
        travelerNotificationService.createNotification(
                savedUser.getEmail(),
                TravelerNotificationType.SYSTEM,
                "Profile Updated",
                "Your profile details were saved successfully."
        );
        return UserSettingsResponse.fromUser(savedUser);
    }

    @Transactional
    public UserSettingsResponse updatePreferences(String userEmail, UpdatePreferenceSettingsRequest request) {
        User user = getUserOrThrow(userEmail);
        applyDefaults(user);

        user.setPreferredLanguage(request.preferredLanguage().trim());
        user.setPreferredCurrency(normalizeCurrency(request.preferredCurrency()));
        user.setTimeFormat(normalizeTimeFormat(request.timeFormat()));
        user.setTimeZone(request.timeZone().trim());

        User savedUser = userRepository.save(user);
        return UserSettingsResponse.fromUser(savedUser);
    }

    @Transactional
    public UserSettingsResponse updateNotificationSettings(
            String userEmail,
            UpdateNotificationSettingsRequest request
    ) {
        User user = getUserOrThrow(userEmail);
        applyDefaults(user);

        user.setEmailNotificationsEnabled(request.emailNotificationsEnabled());
        user.setSmsNotificationsEnabled(request.smsNotificationsEnabled());

        User savedUser = userRepository.save(user);
        return UserSettingsResponse.fromUser(savedUser);
    }

    private User getUserOrThrow(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String normalizeCurrency(String currency) {
        return currency.trim().toUpperCase();
    }

    private String normalizeTimeFormat(String timeFormat) {
        String normalized = timeFormat.trim()
                .toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');

        if (!SUPPORTED_TIME_FORMATS.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time format must be 12_HOUR or 24_HOUR");
        }

        return normalized;
    }

    private boolean applyDefaults(User user) {
        boolean changed = false;

        if (isBlank(user.getPreferredLanguage())) {
            user.setPreferredLanguage(DEFAULT_LANGUAGE);
            changed = true;
        }

        if (isBlank(user.getPreferredCurrency())) {
            user.setPreferredCurrency(DEFAULT_CURRENCY);
            changed = true;
        }

        if (isBlank(user.getTimeFormat())) {
            user.setTimeFormat(DEFAULT_TIME_FORMAT);
            changed = true;
        }

        if (isBlank(user.getTimeZone())) {
            user.setTimeZone(DEFAULT_TIME_ZONE);
            changed = true;
        }

        if (user.getEmailNotificationsEnabled() == null) {
            user.setEmailNotificationsEnabled(true);
            changed = true;
        }

        if (user.getSmsNotificationsEnabled() == null) {
            user.setSmsNotificationsEnabled(true);
            changed = true;
        }

        return changed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
