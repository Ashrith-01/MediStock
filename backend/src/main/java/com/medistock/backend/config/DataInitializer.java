package com.medistock.backend.config;

import com.medistock.backend.entity.Role;
import com.medistock.backend.enums.RoleName;
import com.medistock.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        createRoleIfNotExists(RoleName.ADMIN);
        createRoleIfNotExists(RoleName.PHARMACIST);
        createRoleIfNotExists(RoleName.STAFF);
    }

    private void createRoleIfNotExists(RoleName roleName) {

        if (roleRepository.findByRoleName(roleName).isEmpty()) {

            Role role = Role.builder()
                    .roleName(roleName)
                    .build();

            roleRepository.save(role);

            System.out.println(roleName + " role created.");
        }
    }
}