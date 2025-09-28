package com.example.paymentreconciliation.board.service;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import com.example.paymentreconciliation.exception.ResourceNotFoundException;
import com.example.paymentreconciliation.board.dao.BoardReceiptRepository;
import java.util.List;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BoardReceiptService {

    private static final Logger log = LoggerFactoryProvider.getLogger(BoardReceiptService.class);

    private final BoardReceiptRepository repository;

    public BoardReceiptService(BoardReceiptRepository repository) {
        this.repository = repository;
    }

    public BoardReceipt create(BoardReceipt boardReceipt) {
        log.info("Persisting board receipt for boardRef={}", boardReceipt.getBoardRef());
        BoardReceipt saved = repository.save(boardReceipt);
        log.info("Persisted board receipt id={}", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<BoardReceipt> findAll() {
        log.info("Retrieving all board receipts");
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public BoardReceipt findById(Long id) {
        log.info("Retrieving board receipt id={}", id);
        return repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Board receipt id={} not found", id);
                    return new ResourceNotFoundException("Board receipt not found for id=" + id);
                });
    }

    public BoardReceipt update(Long id, BoardReceipt updated) {
        log.info("Updating board receipt id={}", id);
        BoardReceipt existing = findById(id);
        existing.setBoardRef(updated.getBoardRef());
        existing.setEmployerRef(updated.getEmployerRef());
        existing.setAmount(updated.getAmount());
        existing.setUtrNumber(updated.getUtrNumber());
        existing.setStatus(updated.getStatus());
        existing.setMaker(updated.getMaker());
        existing.setChecker(updated.getChecker());
        existing.setDate(updated.getDate());
        BoardReceipt saved = repository.save(existing);
        log.info("Updated board receipt id={}", saved.getId());
        return saved;
    }

    public void delete(Long id) {
        log.info("Deleting board receipt id={}", id);
        if (!repository.existsById(id)) {
            log.warn("Cannot delete board receipt id={} because it does not exist", id);
            throw new ResourceNotFoundException("Board receipt not found for id=" + id);
        }
        repository.deleteById(id);
        log.info("Deleted board receipt id={}", id);
    }
}
