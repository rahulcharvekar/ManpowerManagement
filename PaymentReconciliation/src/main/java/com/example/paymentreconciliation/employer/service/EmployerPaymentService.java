package com.example.paymentreconciliation.employer.service;

import com.example.paymentreconciliation.employer.entity.EmployerPayment;
import com.example.paymentreconciliation.exception.ResourceNotFoundException;
import com.example.paymentreconciliation.employer.dao.EmployerPaymentRepository;
import java.util.List;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployerPaymentService {

    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentService.class);

    private final EmployerPaymentRepository repository;

    public EmployerPaymentService(EmployerPaymentRepository repository) {
        this.repository = repository;
    }

    public EmployerPayment create(EmployerPayment employerPayment) {
        log.info("Persisting employer payment for employerRef={}", employerPayment.getEmployerRefNumber());
        EmployerPayment saved = repository.save(employerPayment);
        log.info("Persisted employer payment id={}", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<EmployerPayment> findAll() {
        log.info("Retrieving all employer payments");
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public EmployerPayment findById(Long id) {
        log.info("Retrieving employer payment id={}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Employer payment id={} not found", id);
                    return new ResourceNotFoundException("Employer payment not found for id=" + id);
                });
    }

    public EmployerPayment update(Long id, EmployerPayment updated) {
        log.info("Updating employer payment id={}", id);
        EmployerPayment existing = findById(id);
        existing.setEmployerRefNumber(updated.getEmployerRefNumber());
        existing.setWorkerRef(updated.getWorkerRef());
        existing.setToli(updated.getToli());
        existing.setBankUtr(updated.getBankUtr());
        existing.setPaymentAmount(updated.getPaymentAmount());
        existing.setPaymentDate(updated.getPaymentDate());
        existing.setMaker(updated.getMaker());
        existing.setChecker(updated.getChecker());
        EmployerPayment saved = repository.save(existing);
        log.info("Updated employer payment id={}", saved.getId());
        return saved;
    }

    public void delete(Long id) {
        log.info("Deleting employer payment id={}", id);
        if (!repository.existsById(id)) {
            log.warn("Cannot delete employer payment id={} because it does not exist", id);
            throw new ResourceNotFoundException("Employer payment not found for id=" + id);
        }
        repository.deleteById(id);
        log.info("Deleted employer payment id={}", id);
    }
}
