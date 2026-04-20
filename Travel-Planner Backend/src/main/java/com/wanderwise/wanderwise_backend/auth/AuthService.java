package com.wanderwise.wanderwise_backend.auth;

import com.wanderwise.wanderwise_backend.auth.dto.AuthRequest;
import com.wanderwise.wanderwise_backend.auth.dto.AuthResponse;
import com.wanderwise.wanderwise_backend.auth.dto.SignupRequest;
import com.wanderwise.wanderwise_backend.security.JwtService;
import com.wanderwise.wanderwise_backend.user.Role;
import com.wanderwise.wanderwise_backend.user.User;
import com.wanderwise.wanderwise_backend.user.UserRepository;
import com.wanderwise.wanderwise_backend.user.UserStatus;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        Role role = request.role() != null ? request.role() : Role.USER;
        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .mobileNumber(request.mobileNumber().trim())
                .role(role)
                .status(UserStatus.ACTIVE)
                .tripsBooked(0)
                .lastLogin(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        return createAuthResponse(savedUser);
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        user.setLastLogin(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        return createAuthResponse(updatedUser);
    }

    private AuthResponse createAuthResponse(User user) {
        Role role = user.getRole() != null ? user.getRole() : Role.USER;
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_" + role.name())
                .build();

        String token = jwtService.generateToken(userDetails);
        return AuthResponse.fromUser(token, user);
    }
}
