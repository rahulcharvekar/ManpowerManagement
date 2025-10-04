package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.dto.AuthResponse;
import com.example.paymentreconciliation.auth.dto.LoginRequest;
import com.example.paymentreconciliation.auth.dto.RegisterRequest;
import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.entity.UserRole;
import com.example.paymentreconciliation.auth.repository.UserRepository;
import com.example.paymentreconciliation.auth.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    public AuthResponse login(LoginRequest loginRequest) {
        logger.info("Attempting login for user: {}", loginRequest.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), 
                loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        logger.info("User {} logged in successfully", user.getUsername());
        
        return new AuthResponse(jwt, user.getId(), user.getUsername(), 
                               user.getEmail(), user.getFullName(), user.getRole());
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        logger.info("Attempting registration for user: {}", registerRequest.getUsername());
        
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        // Create new user account
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword()),
            registerRequest.getFullName(),
            registerRequest.getRole() != null ? registerRequest.getRole() : UserRole.WORKER
        );
        
        userRepository.save(user);
        
        logger.info("User {} registered successfully", user.getUsername());
        
        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                registerRequest.getUsername(), 
                registerRequest.getPassword())
        );
        
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        return new AuthResponse(jwt, user.getId(), user.getUsername(), 
                               user.getEmail(), user.getFullName(), user.getRole());
    }
    
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return Optional.of((User) authentication.getPrincipal());
        }
        return Optional.empty();
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public void updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
        logger.info("User {} status updated to: {}", user.getUsername(), enabled ? "enabled" : "disabled");
    }
}
