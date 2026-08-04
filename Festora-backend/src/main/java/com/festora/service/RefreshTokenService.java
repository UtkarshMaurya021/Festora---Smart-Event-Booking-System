package com.festora.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.festora.entity.RefreshToken;
import com.festora.entity.User;
import com.festora.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    // Refresh token validity: 7 days
    private final long REFRESH_TOKEN_DURATION_MS = 7L * 24 * 60 * 60 * 1000;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Creates (or replaces) the refresh token for a user so each user only
     * ever has a single active refresh token at a time.
     */
    public RefreshToken createRefreshToken(User user) {

        refreshTokenRepository.findByUser(user)
                .ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_DURATION_MS));

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired. Please log in again.");
        }

        return token;
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }

    /**
     * Same lookup as {@link #findByToken(String)} but returns an empty
     * Optional instead of throwing, for callers (like logout) that should
     * succeed silently even if the token is already gone/invalid.
     */
    public java.util.Optional<RefreshToken> findByTokenOptional(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
