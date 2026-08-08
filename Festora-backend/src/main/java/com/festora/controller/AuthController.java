package com.festora.controller;

import com.festora.dto.*;
import com.festora.entity.RefreshToken;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.jwt.JwtUtil;
import com.festora.repository.UserRepository;
import com.festora.service.RefreshTokenService;
import com.festora.service.UserService;

import jakarta.validation.Valid;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository repo;
    private final UserService service;
    private final JwtUtil jwt;
    private final PasswordEncoder encoder;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserRepository repo,
                          UserService service,
                          JwtUtil jwt,
                          PasswordEncoder encoder,
                          RefreshTokenService refreshTokenService){
        this.repo = repo;
        this.service = service;
        this.jwt = jwt;
        this.encoder = encoder;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request){
        User user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Credentials"));

        if (user.getStatus() == Status.INACTIVE) {
            throw new RuntimeException("Your account has been blocked or disabled by the Administrator. Access denied.");
        }

        if (user.getStatus() == Status.PENDING) {
            throw new RuntimeException("Your account is currently PENDING approval by the Administrator. Please wait for activation.");
        }

        if (!encoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwt.generateToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                token,
                refreshToken.getToken(),
                user.getRole().name(),
                user.getName()
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String otp = service.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of(
            "message", "Password Reset OTP sent successfully to email.",
            "otp", otp
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        service.resetPassword(request.getEmail(), request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login with your new password."));
    }

    @PostMapping("/refresh-token")
    public TokenRefreshResponse refreshToken(@RequestBody RefreshTokenRequest request){
        String requestRefreshToken = request.getRefreshToken();
        RefreshToken storedToken = refreshTokenService.findByToken(requestRefreshToken);
        refreshTokenService.verifyExpiration(storedToken);

        String newAccessToken = jwt.generateToken(storedToken.getUser().getEmail());
        return new TokenRefreshResponse(newAccessToken, storedToken.getToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request){
        refreshTokenService.findByTokenOptional(request.getRefreshToken())
                .ifPresent(rt -> refreshTokenService.deleteByUser(rt.getUser()));
        return ResponseEntity.noContent().build();
    }
}