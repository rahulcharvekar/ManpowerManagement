package com.example.paymentreconciliation.board.controller;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import com.example.paymentreconciliation.board.service.BoardReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/board-receipts")
@Tag(name = "Board Receipt Management", description = "APIs for board receipt processing and management")
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

    @GetMapping("/all")
    @Operation(summary = "Get all board receipts with pagination and filtering", 
               description = "Returns paginated board receipts with optional filters for status and date range")
    public ResponseEntity<?> getAllBoardReceipts(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Receipt status filter", example = "PENDING")
            @RequestParam(required = false) String status,
            @Parameter(description = "Single date filter (YYYY-MM-DD)", example = "2024-01-15")
            @RequestParam(required = false) String singleDate,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate
    ) {
        log.info("Fetching all board receipts with filters - page: {}, size: {}, status: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, singleDate, startDate, endDate);
        
        try {
            return ResponseEntity.ok(service.getAllBoardReceiptsWithFilters(page, size, status, singleDate, startDate, endDate));
        } catch (Exception e) {
            log.error("Error fetching all board receipts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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

    @GetMapping("/board-ref/{boardRef}")
    @Operation(summary = "Get board receipt by board reference number", 
               description = "Returns board receipt details for a specific board reference")
    public ResponseEntity<?> getByBoardRef(
            @Parameter(description = "Board reference number") 
            @PathVariable String boardRef) {
        log.info("Fetching board receipt for board ref: {}", boardRef);
        
        return service.findByBoardRef(boardRef)
                .map(receipt -> ResponseEntity.ok(receipt))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/employer-ref/{employerRef}")
    @Operation(summary = "Get board receipt by employer reference number", 
               description = "Returns board receipt details for a specific employer reference")
    public ResponseEntity<?> getByEmployerRef(
            @Parameter(description = "Employer reference number") 
            @PathVariable String employerRef) {
        log.info("Fetching board receipt for employer ref: {}", employerRef);
        
        return service.findByEmployerRef(employerRef)
                .map(receipt -> ResponseEntity.ok(receipt))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/process")
    @Operation(summary = "Process board receipt with UTR number", 
               description = "Processes a board receipt by adding UTR number and changing status to VERIFIED")
    public ResponseEntity<?> processBoardReceipt(@RequestBody BoardReceiptProcessRequest request) {
        log.info("Processing board receipt: {} with UTR: {} by checker: {}", 
                request.getBoardRef(), request.getUtrNumber(), request.getChecker());
        
        try {
            BoardReceipt processedReceipt = service.processBoardReceipt(
                request.getBoardRef(),
                request.getUtrNumber(),
                request.getChecker()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Board receipt processed successfully",
                "boardRef", processedReceipt.getBoardRef(),
                "employerRef", processedReceipt.getEmployerRef(),
                "utrNumber", processedReceipt.getUtrNumber(),
                "status", processedReceipt.getStatus(),
                "amount", processedReceipt.getAmount(),
                "checker", processedReceipt.getChecker(),
                "processedDate", processedReceipt.getDate()
            ));
            
        } catch (Exception e) {
            log.error("Error processing board receipt: {}", request.getBoardRef(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get board receipts by status", 
               description = "Returns all board receipts with the specified status")
    public ResponseEntity<List<BoardReceipt>> getByStatus(
            @Parameter(description = "Board receipt status") 
            @PathVariable String status) {
        log.info("Fetching board receipts with status: {}", status);
        
        try {
            List<BoardReceipt> receipts = service.findByStatus(status);
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            log.error("Error fetching board receipts by status: {}", status, e);
            return ResponseEntity.badRequest().build();
        }
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

    // Request DTO class
    public static class BoardReceiptProcessRequest {
        private String boardRef;
        private String utrNumber;
        private String checker;

        public String getBoardRef() {
            return boardRef;
        }

        public void setBoardRef(String boardRef) {
            this.boardRef = boardRef;
        }

        public String getUtrNumber() {
            return utrNumber;
        }

        public void setUtrNumber(String utrNumber) {
            this.utrNumber = utrNumber;
        }

        public String getChecker() {
            return checker;
        }

        public void setChecker(String checker) {
            this.checker = checker;
        }
    }
}
