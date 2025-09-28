package com.example.paymentreconciliation.board.controller;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import com.example.paymentreconciliation.board.service.BoardReceiptService;
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
@RequestMapping("/api/v1/board-receipts")
public class BoardReceiptController {

    private static final Logger log = LoggerFactoryProvider.getLogger(BoardReceiptController.class);

    private final BoardReceiptService service;

    public BoardReceiptController(BoardReceiptService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BoardReceipt> create(@RequestBody BoardReceipt boardReceipt) {
        log.info("Creating board receipt for boardRef={}", boardReceipt.getBoardRef());
        BoardReceipt created = service.create(boardReceipt);
        log.info("Created board receipt id={}", created.getId());
        return ResponseEntity.created(URI.create("/api/v1/board-receipts/" + created.getId()))
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<BoardReceipt>> findAll() {
        log.info("Fetching all board receipts");
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardReceipt> findById(@PathVariable("id") Long id) {
        log.info("Fetching board receipt id={}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardReceipt> update(@PathVariable("id") Long id, @RequestBody BoardReceipt boardReceipt) {
        log.info("Updating board receipt id={}", id);
        return ResponseEntity.ok(service.update(id, boardReceipt));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        log.info("Deleting board receipt id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
