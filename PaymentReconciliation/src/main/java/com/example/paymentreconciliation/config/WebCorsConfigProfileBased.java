package com.example.paymentreconciliation.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebCorsConfigProfileBased {

    @Bean
    @Profile("dev")
    public CorsFilter corsFilterDev() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Use addAllowedOriginPattern instead of addAllowedOrigin when credentials are enabled
        config.addAllowedOriginPattern("http://localhost:5173");
        config.addAllowedOriginPattern("http://localhost:5174"); // backup port
        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    @Profile("prod")
    public CorsFilter corsFilterProd() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Production: Specify exact allowed origins for security
        config.addAllowedOrigin("https://rahulcharvekar.github.io");
        config.addAllowedOrigin("https://rahulcharvekar.github.io/ManpowerManagement");
        // Add more specific origins as needed for additional frontend applications
        
        config.setAllowCredentials(true);
        
        // Set allowed headers
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("X-Requested-With");
        config.addAllowedHeader("Accept");
        
        // Set allowed methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    @Profile("staging")
    public CorsFilter corsFilterStaging() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Staging: Allow GitHub Pages and some development origins
        config.addAllowedOrigin("https://rahulcharvekar.github.io");
        config.addAllowedOrigin("https://rahulcharvekar.github.io/ManpowerManagement");
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:8080");
        
        config.setAllowCredentials(true);
        
        // Set allowed headers
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("X-Requested-With");
        config.addAllowedHeader("Accept");
        
        // Set allowed methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
