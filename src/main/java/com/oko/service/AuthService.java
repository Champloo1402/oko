package com.oko.service;

import com.oko.dto.request.LoginRequest;
import com.oko.dto.request.RegisterRequest;
import com.oko.dto.response.AuthResponse;
import com.oko.entity.User;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.UserRepository;
import com.oko.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername();
        String email = request.getEmail();
        String password = request.getPassword();
        String passwordHashed = passwordEncoder.encode(password);

        if(userRepository.existsByUsername(username)){
            throw new DuplicateResourceException("Username is already in use");
        }

        if(userRepository.existsByEmail(email)){
            throw new DuplicateResourceException("Email is already in use");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordHashed);

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);

        return new AuthResponse(token, username, user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        String usernameOrEmail = request.getUsernameOrEmail();
        String password = request.getPassword();
        User user;

        if(usernameOrEmail.contains("@")){
            user = userRepository.findByEmail(usernameOrEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User with this email not found"));
        } else {
            user = userRepository.findByUsername(usernameOrEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken((user.getUsername()), password));

        String token = jwtTokenProvider.generateToken(user);

        return new AuthResponse(token, user.getUsername(), user.getRole().name());

    }


}
