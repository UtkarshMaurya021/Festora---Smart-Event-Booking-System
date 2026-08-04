package com.festora.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET =
            "FestoraSecretKeyFestoraSecretKey1234567890";

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Access token validity: 15 minutes. Short-lived on purpose now that a
    // refresh token exists to silently obtain a new one.
    private final long ACCESS_TOKEN_VALIDITY_MS = 15 * 60 * 1000;

    public String generateToken(String email){

        return Jwts.builder()

                .subject(email)

                .issuedAt(new Date())

                .expiration(new Date(System.currentTimeMillis()+ACCESS_TOKEN_VALIDITY_MS))

                .signWith(key)

                .compact();
    }

    public String extractEmail(String token){

        return Jwts.parser()

                .verifyWith((javax.crypto.SecretKey) key)

                .build()

                .parseSignedClaims(token)

                .getPayload()

                .getSubject();

    }

}