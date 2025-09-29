package com.example.paymentreconciliation.worker.service;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import com.example.paymentreconciliation.exception.ResourceNotFoundException;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentRepository;
import java.util.List;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WorkerPaymentService {

    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentService.class);

    private final WorkerPaymentRepository repository;

    public WorkerPaymentService(WorkerPaymentRepository repository) {
        this.repository = repository;
    }

    public WorkerPayment create(WorkerPayment workerPayment) {
        log.info("Persisting worker payment for workerRef={}", workerPayment.getWorkerRef());
        WorkerPayment saved = repository.save(workerPayment);
        log.info("Persisted worker payment id={}", saved.getId());
        return saved;
    }

    public List<WorkerPayment> createBulk(List<WorkerPayment> workerPayments) {
        log.info("Bulk persisting {} worker payments", workerPayments.size());
        List<WorkerPayment> saved = repository.saveAll(workerPayments);
        log.info("Bulk persisted {} worker payments", saved.size());
        return saved;
    }

    public List<WorkerPayment> updateBulk(List<WorkerPayment> workerPayments) {
        log.info("Bulk updating {} worker payments", workerPayments.size());
        List<WorkerPayment> saved = repository.saveAll(workerPayments);
        log.info("Bulk updated {} worker payments", saved.size());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<WorkerPayment> findByRequestReferencePrefix(String prefix) {
        log.info("Finding worker payments with request reference starting with: {}", prefix);
        return repository.findByRequestReferenceNumberStartingWith(prefix);
    }

    @Transactional(readOnly = true)
    public List<WorkerPayment> findByStatus(WorkerPaymentStatus status) {
        log.info("Finding worker payments with status: {}", status);
        return repository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<WorkerPayment> findByReferencePrefixAndStatus(String prefix, WorkerPaymentStatus status) {
        log.info("Finding worker payments with reference prefix: {} and status: {}", prefix, status);
        return repository.findByRequestReferenceNumberStartingWithAndStatus(prefix, status);
    }

    @Transactional(readOnly = true)
    public List<WorkerPayment> findAll() {
        log.info("Retrieving all worker payments");
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public WorkerPayment findById(Long id) {
        log.info("Retrieving worker payment id={}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Worker payment id={} not found", id);
                    return new ResourceNotFoundException("Worker payment not found for id=" + id);
                });
    }

    public WorkerPayment update(Long id, WorkerPayment updated) {
        log.info("Updating worker payment id={}", id);
        WorkerPayment existing = findById(id);
        existing.setWorkerRef(updated.getWorkerRef());
        existing.setRegId(updated.getRegId());
        existing.setName(updated.getName());
        existing.setToli(updated.getToli());
        existing.setAadhar(updated.getAadhar());
        existing.setPan(updated.getPan());
        existing.setBankAccount(updated.getBankAccount());
        existing.setPaymentAmount(updated.getPaymentAmount());
        if (updated.getRequestReferenceNumber() != null && !updated.getRequestReferenceNumber().isBlank()) {
            existing.setRequestReferenceNumber(updated.getRequestReferenceNumber());
        }
        WorkerPayment saved = repository.save(existing);
        log.info("Updated worker payment id={}", saved.getId());
        return saved;
    }

    public void delete(Long id) {
        log.info("Deleting worker payment id={}", id);
        if (!repository.existsById(id)) {
            log.warn("Cannot delete worker payment id={} because it does not exist", id);
            throw new ResourceNotFoundException("Worker payment not found for id=" + id);
        }
        repository.deleteById(id);
        log.info("Deleted worker payment id={}", id);
    }
}
