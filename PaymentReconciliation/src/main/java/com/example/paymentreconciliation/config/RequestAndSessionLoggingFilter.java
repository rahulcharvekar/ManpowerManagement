package com.example.paymentreconciliation.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestAndSessionLoggingFilter implements Filter {
    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String SESSION_ID_HEADER = "X-Session-ID";
    private static final String SESSION_TOKEN_HEADER = "sessionToken";
    private static final String SESSION_COOKIE = "JSESSIONID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        try {
            if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
                // X-Request-ID
                String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
                if (requestId == null || requestId.isBlank()) {
                    requestId = UUID.randomUUID().toString();
                }
                MDC.put(REQUEST_ID_HEADER, requestId);

                // sessionToken (prefer header, then parameter, then cookie)
                String sessionToken = httpRequest.getHeader(SESSION_TOKEN_HEADER);
                if (sessionToken == null || sessionToken.isBlank()) {
                    sessionToken = httpRequest.getParameter(SESSION_TOKEN_HEADER);
                }
                if ((sessionToken == null || sessionToken.isBlank()) && httpRequest.getCookies() != null) {
                    for (var cookie : httpRequest.getCookies()) {
                        if (SESSION_TOKEN_HEADER.equals(cookie.getName())) {
                            sessionToken = cookie.getValue();
                            break;
                        }
                    }
                }
                // Generate if missing
                if (sessionToken == null || sessionToken.isBlank()) {
                    sessionToken = UUID.randomUUID().toString();
                    httpResponse.setHeader(SESSION_TOKEN_HEADER, sessionToken);
                }
                MDC.put("sessionToken", sessionToken);
            }
            chain.doFilter(request, response);
        } finally {
            MDC.remove(REQUEST_ID_HEADER);
            MDC.remove("sessionToken");
        }
    }
}
