package com.medistock.backend.service;

import com.medistock.backend.dto.request.LoginRequest;
import com.medistock.backend.dto.request.RegisterRequest;
import com.medistock.backend.dto.response.AuthResponse;
import com.medistock.backend.entity.Role;
import com.medistock.backend.entity.User;
import com.medistock.backend.enums.RoleName;
import com.medistock.backend.exception.InvalidCredentialsException;
import com.medistock.backend.repository.RoleRepository;
import com.medistock.backend.repository.UserRepository;
import com.medistock.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerShouldAssignStaffRoleAndExposeUserInfo() {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Ada")
                .lastName("Lovelace")
                .email("ADA@EXAMPLE.COM")
                .password("secret123")
                .phoneNumber("+123456789")
                .role("ADMIN")
                .build();

        when(userRepository.existsByEmail("ada@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(roleRepository.findByRoleName(RoleName.STAFF)).thenReturn(Optional.of(Role.builder().roleName(RoleName.STAFF).build()));
        when(jwtService.generateToken("ada@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Ada", savedUser.getFirstName());
        assertEquals(RoleName.STAFF, savedUser.getRole().getRoleName());
        assertEquals("ada@example.com", savedUser.getEmail());
        assertEquals("encoded-password", savedUser.getPassword());

        assertEquals("jwt-token", response.getToken());
        assertEquals("User registered successfully", response.getMessage());
        assertEquals("ada@example.com", response.getEmail());
        assertEquals("STAFF", response.getRole());
        assertEquals("Ada", response.getFirstName());
    }

    @Test
    void loginShouldThrowCustomExceptionWhenCredentialsAreInvalid() {
        LoginRequest request = LoginRequest.builder()
                .email("ada@example.com")
                .password("wrong")
                .build();

        doThrow(new RuntimeException("bad credentials"))
                .when(authenticationManager)
                .authenticate(any());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }
}
