package com.festora.controller;

import com.festora.dto.*;
import com.festora.entity.RefreshToken;
import com.festora.entity.User;
import com.festora.jwt.JwtUtil;
import com.festora.repository.UserRepository;
import com.festora.service.RefreshTokenService;
import com.festora.service.UserService;

import jakarta.validation.Valid;

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

        this.repo=repo;

        this.service=service;

        this.jwt=jwt;

        this.encoder=encoder;

        this.refreshTokenService=refreshTokenService;

    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")

    public AuthResponse login(

            @RequestBody LoginRequest request){

        User user=repo.findByEmail(request.getEmail())

                .orElseThrow();

        if(!encoder.matches(request.getPassword(),
                user.getPassword())){

            throw new RuntimeException("Invalid Credentials");

        }

        String token=jwt.generateToken(user.getEmail());

        RefreshToken refreshToken=refreshTokenService.createRefreshToken(user);

        return new AuthResponse(token,
                refreshToken.getToken(),
        		user.getRole().name(),
        		user.getName());

    }

    @PostMapping("/refresh-token")

    public TokenRefreshResponse refreshToken(
            @RequestBody RefreshTokenRequest request){

        String requestRefreshToken = request.getRefreshToken();

        RefreshToken storedToken = refreshTokenService.findByToken(requestRefreshToken);

        refreshTokenService.verifyExpiration(storedToken);

        String newAccessToken = jwt.generateToken(storedToken.getUser().getEmail());

        return new TokenRefreshResponse(newAccessToken, storedToken.getToken());

    }

    @PostMapping("/logout")

    public ResponseEntity<Void> logout(
            @RequestBody RefreshTokenRequest request){

        refreshTokenService.findByTokenOptional(request.getRefreshToken())
                .ifPresent(rt -> refreshTokenService.deleteByUser(rt.getUser()));

        return ResponseEntity.noContent().build();

    }

}