package com.oko.config;

import com.oko.entity.User;
import com.oko.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default-password}")
    private String adminDefaultPassword;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@oko.com");
            admin.setPassword(passwordEncoder.encode(adminDefaultPassword));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
        }
    }
}