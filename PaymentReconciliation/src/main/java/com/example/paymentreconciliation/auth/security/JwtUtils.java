package com.example.paymentreconciliation.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    
    @Value("${app.jwt.secret:mySecretKey}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400}")
    private int jwtExpirationMs;
    
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        
        // Extract roles and permissions
        java.util.Set<String> roles = userPrincipal.getAuthorities().stream()
            .filter(auth -> auth.getAuthority().startsWith("ROLE_"))
            .map(auth -> auth.getAuthority().substring(5)) // Remove "ROLE_" prefix
            .collect(java.util.stream.Collectors.toSet());
            
        java.util.Set<String> permissions = userPrincipal.getAuthorities().stream()
            .filter(auth -> auth.getAuthority().startsWith("PERM_"))
            .map(auth -> auth.getAuthority().substring(5)) // Remove "PERM_" prefix
            .collect(java.util.stream.Collectors.toSet());
        
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("roles", roles)
                .claim("permissions", permissions)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(jwtExpirationMs, ChronoUnit.SECONDS)))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }
    
    public String generateTokenFromUsername(String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(jwtExpirationMs, ChronoUnit.SECONDS)))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }
    
    private SecretKey getSigningKey() {
        try {
            // Try hex decoding first (for hex strings like in config)
            byte[] keyBytes = hexStringToByteArray(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            // Fallback to base64 decoding
            try {
                byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
                return Keys.hmacShaKeyFor(keyBytes);
            } catch (Exception ex) {
                // Use string directly if both fail
                return Keys.hmacShaKeyFor(jwtSecret.getBytes());
            }
        }
    }
    
    private byte[] hexStringToByteArray(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                                 + Character.digit(hex.charAt(i+1), 16));
        }
        return data;
    }
    
    public String getUserNameFromJwtToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from JWT: {}", e.getMessage());
            return null;
        }
    }
    
    @SuppressWarnings("unchecked")
    public java.util.Set<String> getRolesFromToken(String token) {
        try {
            io.jsonwebtoken.Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
                    
            java.util.List<String> rolesList = (java.util.List<String>) claims.get("roles");
            return rolesList != null ? new java.util.HashSet<>(rolesList) : new java.util.HashSet<>();
        } catch (Exception e) {
            logger.error("Cannot get roles from JWT token: {}", e.getMessage());
            return new java.util.HashSet<>();
        }
    }
    
    @SuppressWarnings("unchecked")
    public java.util.Set<String> getPermissionsFromToken(String token) {
        try {
            io.jsonwebtoken.Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
                    
            java.util.List<String> permissionsList = (java.util.List<String>) claims.get("permissions");
            return permissionsList != null ? new java.util.HashSet<>(permissionsList) : new java.util.HashSet<>();
        } catch (Exception e) {
            logger.error("Cannot get permissions from JWT token: {}", e.getMessage());
            return new java.util.HashSet<>();
        }
    }
    
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(authToken);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        
        return false;
    }
}
