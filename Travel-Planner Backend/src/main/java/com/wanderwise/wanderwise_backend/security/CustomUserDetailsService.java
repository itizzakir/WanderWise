package com.wanderwise.wanderwise_backend.security;

import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import com.wanderwise.wanderwise_backend.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        UserStatus status = user.getStatus() != null ? user.getStatus() : UserStatus.ACTIVE;

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + role.name())
                .accountLocked(status == UserStatus.SUSPENDED)
                .disabled(status == UserStatus.DISABLED)
                .build();
    }
}
