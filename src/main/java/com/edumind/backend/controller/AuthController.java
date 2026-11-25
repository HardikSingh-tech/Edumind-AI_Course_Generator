package com.edumind.backend.controller;

import com.edumind.backend.dto.ApiResponse;
import com.edumind.backend.entity.User;
import com.edumind.backend.repository.UserRepository;
import com.edumind.backend.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record RegisterRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Password is required") String password
    ) {}

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email().toLowerCase().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered", "Registration failed"));
        }

        User user = User.builder()
                .name(req.name().trim())
                .email(req.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role("INSTRUCTOR")
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                Map.of(
                        "token", token,
                        "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole())
                ),
                "User registered successfully"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase().trim())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password", "Authentication failed"));
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "token", token,
                        "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail(), "role", user.getRole())
                ),
                "Login successful"
        ));
    }
}
