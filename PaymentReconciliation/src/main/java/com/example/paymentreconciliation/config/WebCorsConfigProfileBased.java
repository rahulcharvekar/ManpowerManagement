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
        
        // Development: Allow all origins with credentials
        config.addAllowedOriginPattern("*");
        config.setAllowCredentials(true);
        
        // Set allowed headers
        config.addAllowedHeader("*");
        
        // Set allowed methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("HEAD");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    @Profile("prod")
    public CorsFilter corsFilterProd() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Production: Specify exact allowed origins for security
        config.addAllowedOrigin("https://your-frontend-domain.com");
        config.addAllowedOrigin("https://your-admin-panel.com");
        // Add more specific origins as needed
        
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
