package com.example.paymentreconciliation.employer.controller;

import com.example.paymentreconciliation.employer.entity.EmployerPayment;
import com.example.paymentreconciliation.employer.service.EmployerPaymentService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/employer-payments")
public class EmployerPaymentController {

    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentController.class);

    private final EmployerPaymentService service;

    public EmployerPaymentController(EmployerPaymentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmployerPayment> create(@RequestBody EmployerPayment employerPayment) {
        log.info("Creating employer payment for employerRef={}", employerPayment.getEmployerRefNumber());
        EmployerPayment created = service.create(employerPayment);
        log.info("Created employer payment id={}", created.getId());
        return ResponseEntity.created(URI.create("/api/v1/employer-payments/" + created.getId()))
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<EmployerPayment>> findAll() {
        log.info("Fetching all employer payments");
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployerPayment> findById(@PathVariable("id") Long id) {
        log.info("Fetching employer payment id={}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployerPayment> update(@PathVariable("id") Long id, @RequestBody EmployerPayment employerPayment) {
        log.info("Updating employer payment id={}", id);
        return ResponseEntity.ok(service.update(id, employerPayment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        log.info("Deleting employer payment id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
