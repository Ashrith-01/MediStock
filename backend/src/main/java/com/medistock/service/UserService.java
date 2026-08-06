package com.medistock.service;

import com.medistock.dto.UserResponse;
import com.medistock.entity.Role;
import com.medistock.entity.User;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.UserRepository;
import com.medistock.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String roleStr, UserPrincipal currentUser) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role specified: " + roleStr + ". Allowed values: ADMIN, PHARMACIST, STAFF.");
        }

        if (currentUser != null && currentUser.getId().equals(targetUser.getId()) && newRole != Role.ADMIN) {
            throw new IllegalArgumentException("You cannot remove Admin role from your own active account.");
        }

        targetUser.setRole(newRole);
        User saved = userRepository.save(targetUser);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, boolean enabled, UserPrincipal currentUser) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (currentUser != null && currentUser.getId().equals(targetUser.getId()) && !enabled) {
            throw new IllegalArgumentException("You cannot disable your own active user account.");
        }

        targetUser.setEnabled(enabled);
        User saved = userRepository.save(targetUser);
        return UserResponse.fromEntity(saved);
    }
}
