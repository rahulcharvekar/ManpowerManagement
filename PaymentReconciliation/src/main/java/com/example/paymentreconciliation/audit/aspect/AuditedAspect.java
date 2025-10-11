package com.example.paymentreconciliation.audit.aspect;

import com.example.paymentreconciliation.audit.annotation.Audited;
import com.example.paymentreconciliation.audit.entity.AuditEvent;
import com.example.paymentreconciliation.audit.service.AuditEventService;
import com.example.paymentreconciliation.config.AuditingProperties;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.MDC;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;

@Aspect
@Component
@Order(1)
public class AuditedAspect {
    private final AuditEventService auditEventService;
    private final AuditingProperties auditingProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditedAspect(AuditEventService auditEventService, AuditingProperties auditingProperties) {
        this.auditEventService = auditEventService;
        this.auditingProperties = auditingProperties;
    }

    @Around("@annotation(com.example.paymentreconciliation.audit.annotation.Audited)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        // Check if auditing is enabled
        if (!auditingProperties.isEnabled()) {
            return joinPoint.proceed();
        }
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Audited audited = signature.getMethod().getAnnotation(Audited.class);
        String action = audited.action();
        String resourceType = audited.resourceType();
        // Get traceId from MDC or generate if missing
        String traceId = MDC.get("X-Request-ID");
        if (traceId == null) {
            traceId = UUID.randomUUID().toString();
        }

        // Get authenticated user
        String userId = "system";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            userId = authentication.getName();
        }

        // Get HTTP request info
        String clientIp = null;
        String userAgent = null;
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes servletRequestAttributes) {
            HttpServletRequest request = servletRequestAttributes.getRequest();
            clientIp = request.getRemoteAddr();
            userAgent = request.getHeader("User-Agent");
        }

        String outcome = "SUCCESS";
        String details = null;
        String oldValues = null;
        String newValues = null;
        Object result = null;

        // Serialize method arguments as oldValues (before)
        try {
            oldValues = objectMapper.writeValueAsString(joinPoint.getArgs());
        } catch (Exception e) {
            oldValues = "[unserializable arguments]";
        }
        try {
            result = joinPoint.proceed();
            // Serialize return value as newValues (after)
            try {
                newValues = objectMapper.writeValueAsString(result);
            } catch (Exception e) {
                newValues = "[unserializable result]";
            }
            outcome = "SUCCESS";
            return result;
        } catch (Throwable ex) {
            outcome = "FAILURE";
            throw ex;
        } finally {
            AuditEvent event = new AuditEvent();
            event.setAction(action);
            event.setResourceType(resourceType);
            event.setTraceId(traceId);
            event.setUserId(userId);
            event.setOutcome(outcome);
            event.setDetails(details);
            event.setOldValues(oldValues);
            event.setNewValues(newValues);
            event.setClientIp(clientIp);
            event.setUserAgent(userAgent);
            auditEventService.recordEvent(event, null);
        }
    }
}
