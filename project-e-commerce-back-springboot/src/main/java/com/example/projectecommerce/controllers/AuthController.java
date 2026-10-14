package com.example.projectecommerce.controllers;

import com.example.projectecommerce.dto.AuthMeResponse;
import com.example.projectecommerce.dto.AuthRequest;
import com.example.projectecommerce.dto.RegisterRequest;
import com.example.projectecommerce.dto.UpdateAccountRequest;
import com.example.projectecommerce.dto.UpdateAccountResponse;
import com.example.projectecommerce.models.UserEntity;
import com.example.projectecommerce.repositories.UserRepository;
import com.example.projectecommerce.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public String authenticate(@RequestBody AuthRequest authRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.email(),
                        authRequest.password()
                )
        );

        if (authentication.isAuthenticated()) {
            String role = authentication
                    .getAuthorities()
                    .iterator()
                    .next()
                    .getAuthority();
            return jwtService.generateToken(authRequest.email(), role);
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterRequest registerRequest) {
        UserEntity user = UserEntity.builder()
                .name(registerRequest.name())
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(UserEntity.Role.USER)
                .build();
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/me")
    public AuthMeResponse me(Authentication authentication) {
        UserEntity user = userRepository.findByEmailAndActive(authentication.getName(), true)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return new AuthMeResponse(user.getName(), user.getEmail(), user.getRole().name());
    }

    @PutMapping("/account")
    public UpdateAccountResponse updateAccount(@RequestBody UpdateAccountRequest request, Authentication authentication) {
        UserEntity user = userRepository.findByEmailAndActive(authentication.getName(), true)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (request.currentPassword() == null || !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mot de passe actuel incorrect");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom est obligatoire");
        }

        String newEmail = request.email() == null || request.email().isBlank()
                ? user.getEmail()
                : request.email().trim();
        if (!newEmail.equalsIgnoreCase(user.getEmail())) {
            userRepository.findByEmail(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet email est déjà utilisé");
                }
            });
            user.setEmail(newEmail);
        }

        user.setName(request.name().trim());

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.newPassword().length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nouveau mot de passe doit contenir au moins 6 caractères");
            }
            user.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new UpdateAccountResponse(user.getName(), user.getEmail(), user.getRole().name(), token);
    }
}
