package com.medistock.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "my_super_secret_key_for_medistock_application_123456789";

    private static final long EXPIRATION_TIME =
            1000 * 60 * 60 * 24;

    public String generateToken(String email) {

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String extractUsername(String token) {

        return extractClaim(token, Claims::getSubject);
    }


    // Existing method - kept unchanged
    public boolean isTokenValid(String token, String email) {

        final String username = extractUsername(token);

        if (username == null) {
            return false;
        }

        return username.equals(email) && !isTokenExpired(token);
    }


    // Added for Spring Security UserDetails validation
    public boolean isTokenValid(String token, UserDetails userDetails) {

        final String username = extractUsername(token);

        if (username == null) {
            return false;
        }

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }


    private boolean isTokenExpired(String token) {

        Date expiration = extractExpiration(token);

        if (expiration == null) {
            return true;
        }

        return expiration.before(new Date());
    }


    private Date extractExpiration(String token) {

        return extractClaim(token, Claims::getExpiration);
    }


    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        try {

            final Claims claims = extractAllClaims(token);

            return claims == null
                    ? null
                    : claimsResolver.apply(claims);

        } catch (JwtException | IllegalArgumentException e) {

            return null;
        }
    }


    private Claims extractAllClaims(String token) {

        try {

            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        } catch (JwtException | IllegalArgumentException e) {

            return null;
        }
    }


    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes()
        );
    }
}