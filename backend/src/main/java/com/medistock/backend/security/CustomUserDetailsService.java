package com.medistock.backend.security;

import com.medistock.backend.entity.User;
import com.medistock.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private static final String ROLE_PREFIX = "ROLE_";

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        String normalizedEmail = Optional.ofNullable(email)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(e -> !e.isBlank())
                .orElseThrow(() ->
                        new UsernameNotFoundException("Email cannot be null or empty"));

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + normalizedEmail));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(getAuthorities(user))
                .disabled(!Boolean.TRUE.equals(user.getEnabled()))
                .build();
    }

    private List<GrantedAuthority> getAuthorities(User user) {

        if (user.getRole() == null) {
            throw new IllegalStateException(
                    "User has no assigned role: " + user.getEmail());
        }

        return List.of(
                new SimpleGrantedAuthority(
                        ROLE_PREFIX + user.getRole().getRoleName().name()
                )
        );
    }
}