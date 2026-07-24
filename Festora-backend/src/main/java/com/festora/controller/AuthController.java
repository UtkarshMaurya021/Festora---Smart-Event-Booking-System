package com.festora.controller;

import com.festora.dto.*;
import com.festora.entity.User;
import com.festora.jwt.JwtUtil;
import com.festora.repository.UserRepository;
import com.festora.service.UserService;

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

    public AuthController(UserRepository repo,
                          UserService service,
                          JwtUtil jwt,
                          PasswordEncoder encoder){

        this.repo=repo;

        this.service=service;

        this.jwt=jwt;

        this.encoder=encoder;

    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
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

        return new AuthResponse(token,
        		user.getRole().name(),
        		user.getName());

    }

}