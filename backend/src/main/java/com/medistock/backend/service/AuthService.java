package com.medistock.backend.service;

import com.medistock.backend.dto.request.LoginRequest;
import com.medistock.backend.dto.request.RegisterRequest;
import com.medistock.backend.dto.response.AuthResponse;
import com.medistock.backend.entity.Role;
import com.medistock.backend.entity.User;
import com.medistock.backend.enums.RoleName;
import com.medistock.backend.exception.EmailAlreadyExistsException;
import com.medistock.backend.exception.InvalidCredentialsException;
import com.medistock.backend.exception.RoleNotFoundException;
import com.medistock.backend.repository.RoleRepository;
import com.medistock.backend.repository.UserRepository;
import com.medistock.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        Role role = roleRepository.findByRoleName(RoleName.STAFF)
                .orElseThrow(() -> new RoleNotFoundException("Role not found: STAFF"));

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber().trim())
                .enabled(true)
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        log.info("New user registered: {}", email);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(role.getRoleName().name())
                .firstName(user.getFirstName())
                .message("User registered successfully")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        String token = jwtService.generateToken(user.getEmail());
        log.info("User logged in: {}", email);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().getRoleName().name())
                .firstName(user.getFirstName())
                .message("Login successful")
                .build();
    }
}