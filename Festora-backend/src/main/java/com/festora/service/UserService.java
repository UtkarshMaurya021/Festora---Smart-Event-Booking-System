package com.festora.service;

import com.festora.dto.RegisterRequest;
import com.festora.entity.User;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public User register(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(encoder.encode(request.getPassword()));

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_USER;
        user.setRole(role);

        // Organizers need admin approval before they can log in and create events
        user.setStatus(role == Role.ROLE_ORGANIZER ? Status.PENDING : Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        return repo.save(user);
    }
}