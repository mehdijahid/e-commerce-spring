package com.example.projectecommerce.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;

@Service
public class JwtService {

    private static final String SECRET = "mehdi_jahid_mehdi_jahid_mehdi_jahid"; // min 32 chars

    public String generateToken(String username, String role) {
        HashMap<String, Object> claims = new HashMap<>();
        claims.put("Role", role);
        return Jwts.builder()
                .setSubject(username) // who is the user
                .setIssuedAt(new Date()) // when created
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 h
                .addClaims(claims)
                .signWith(getSignedKey(), SignatureAlgorithm.HS256) // signature
                .compact();
    }

    private Key getSignedKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // MUST be public (used outside)
    public Claims verifySignatureAndExtractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignedKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return verifySignatureAndExtractAllClaims(token).getSubject();
    }

    public Date getExpiration(String token) {
        return verifySignatureAndExtractAllClaims(token).getExpiration();
    }

    public boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }
}
