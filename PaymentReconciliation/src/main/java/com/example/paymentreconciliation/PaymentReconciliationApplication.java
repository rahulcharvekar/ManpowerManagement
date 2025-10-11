package com.example.paymentreconciliation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import com.example.paymentreconciliation.common.filter.RequestIdFilter;
import com.example.paymentreconciliation.common.filter.SignatureVerificationFilter;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

@SpringBootApplication
@EnableAsync
public class PaymentReconciliationApplication {

    private static final Logger log = LoggerFactoryProvider.getLogger(PaymentReconciliationApplication.class);
    public static void main(String[] args) {
        log.info("Starting Payment Reconciliation application");
        SpringApplication.run(PaymentReconciliationApplication.class, args);
    }
    @Bean
    public FilterRegistrationBean<RequestIdFilter> requestIdFilterRegistration(RequestIdFilter filter) {
        FilterRegistrationBean<RequestIdFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/*");
        registration.setOrder(1);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<SignatureVerificationFilter> signatureVerificationFilterRegistration(SignatureVerificationFilter filter) {
        FilterRegistrationBean<SignatureVerificationFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(filter);
        registration.addUrlPatterns("/*");
        registration.setOrder(2);
        return registration;
    }
}
