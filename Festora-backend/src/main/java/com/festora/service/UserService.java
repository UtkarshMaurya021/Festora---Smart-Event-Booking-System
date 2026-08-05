package com.festora.service;

import com.festora.dto.RegisterRequest;
import com.festora.entity.PasswordResetToken;
import com.festora.entity.User;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.repository.PasswordResetTokenRepository;
import com.festora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;

    public UserService(UserRepository repo, PasswordEncoder encoder,
                       PasswordResetTokenRepository resetTokenRepository,
                       EmailService emailService) {
        this.repo = repo;
        this.encoder = encoder;
        this.resetTokenRepository = resetTokenRepository;
        this.emailService = emailService;
    }

    public User register(RegisterRequest request) {
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new RuntimeException("Registration password must contain at least 8 characters");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(encoder.encode(request.getPassword()));

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_USER;
        user.setRole(role);

        // Organizers need admin approval before they can log in
        user.setStatus(role == Role.ROLE_ORGANIZER ? Status.PENDING : Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        return repo.save(user);
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email '" + email + "' not found."));

        resetTokenRepository.deleteByUser(user);

        String otp = String.format("%06d", new Random().nextInt(1000000));

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(otp);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setCreatedAt(LocalDateTime.now());

        resetTokenRepository.save(resetToken);

        emailService.sendForgotPasswordEmail(user, otp);

        return otp;
    }

    @Transactional
    public void resetPassword(String email, String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must contain at least 8 characters");
        }

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email '" + email + "' not found."));

        PasswordResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired Password Reset OTP."));

        if (!resetToken.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("OTP does not belong to this email address.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Password Reset OTP has expired. Please request a new one.");
        }

        user.setPassword(encoder.encode(newPassword));
        repo.save(user);

        resetTokenRepository.deleteByUser(user);
    }
}