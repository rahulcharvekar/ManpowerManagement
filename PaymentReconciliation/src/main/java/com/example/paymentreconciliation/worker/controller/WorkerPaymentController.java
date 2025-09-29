package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.service.WorkerPaymentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/worker-payments")
public class WorkerPaymentController {

    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentController.class);

    private final WorkerPaymentService service;

    public WorkerPaymentController(WorkerPaymentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<WorkerPayment> create(@RequestBody WorkerPayment workerPayment) {
        log.info("Creating worker payment for workerRef={}", workerPayment.getWorkerRef());
        WorkerPayment created = service.create(workerPayment);
        log.info("Created worker payment id={}", created.getId());
        return ResponseEntity.created(URI.create("/api/v1/worker-payments/" + created.getId()))
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<WorkerPayment>> findAll() {
        log.info("Fetching all worker payments");
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerPayment> findById(@PathVariable("id") Long id) {
        log.info("Fetching worker payment id={}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/by-reference-prefix")
    public ResponseEntity<List<WorkerPayment>> findByReferencePrefix(@RequestParam("prefix") String prefix) {
        log.info("Fetching worker payments with reference prefix={}", prefix);
        List<WorkerPayment> payments = service.findByRequestReferencePrefix(prefix);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerPayment> update(@PathVariable("id") Long id, @RequestBody WorkerPayment workerPayment) {
        log.info("Updating worker payment id={}", id);
        return ResponseEntity.ok(service.update(id, workerPayment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        log.info("Deleting worker payment id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
