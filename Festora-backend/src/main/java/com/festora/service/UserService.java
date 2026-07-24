package com.festora.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.festora.dto.RegisterRequest;
import com.festora.entity.Organizer;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.OrganizerRepository;
import com.festora.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final OrganizerRepository organizerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       OrganizerRepository organizerRepository,
                       PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.organizerRepository = organizerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(request.getRole());

        user.setStatus(Status.ACTIVE);

        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        if (request.getRole() == Role.ROLE_ORGANIZER) {

            Organizer organizer = new Organizer();

            organizer.setUser(savedUser);

            organizerRepository.save(organizer);
        }

        return savedUser;
    }
}