package com.example.paymentreconciliation.auth.config;

// import com.example.paymentreconciliation.auth.security.PermissionAuthorizationInterceptor;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration to register interceptors
 * 
 * DEPRECATED: Old PermissionAuthorizationInterceptor removed - replaced by Capability+Policy system
 * Authorization is now handled by PolicyEngineService through the new authorization endpoints
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    // DEPRECATED: Old Permission-based interceptor - replaced by PolicyEngineService
    // @Autowired
    // private PermissionAuthorizationInterceptor permissionAuthorizationInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // TODO: Implement new Capability+Policy-based interceptor using PolicyEngineService
        // For now, authorization is handled by individual controllers and services
        
        // registry.addInterceptor(permissionAuthorizationInterceptor)
        //         .addPathPatterns("/api/**") // Apply to all API endpoints
        //         .excludePathPatterns(
        //             "/api/auth/login",
        //             "/api/auth/register",
        //             "/swagger-ui/**",
        //             "/v3/api-docs/**",
        //             "/swagger-resources/**",
        //             "/webjars/**"
        //         );
    }
}
