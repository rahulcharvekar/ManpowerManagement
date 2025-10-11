package com.example.paymentreconciliation.board.controller;

import com.example.paymentreconciliation.audit.annotation.Audited;

import com.example.paymentreconciliation.audit.annotation.Audited;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import com.example.paymentreconciliation.board.service.BoardReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import com.example.paymentreconciliation.common.util.ETagUtil;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/board-receipts")
@Tag(name = "Board Receipt Management", description = "APIs for board receipt processing and management")
@SecurityRequirement(name = "Bearer Authentication")
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
            @Parameter(description = "Start date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-01")
            @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-31")
        @RequestParam(required = true) String endDate,
        HttpServletRequest request
    ) {
        log.info("Fetching all board receipts with filters - page: {}, size: {}, status: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, singleDate, startDate, endDate);
        
        try {
            Object result = service.getAllBoardReceiptsWithFilters(page, size, status, singleDate, startDate, endDate);
            String responseJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result);
            String eTag = ETagUtil.generateETag(responseJson);
            String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);
            if (eTag.equals(ifNoneMatch)) {
                return ResponseEntity.status(304).eTag(eTag).build();
            }
            return ResponseEntity.ok().eTag(eTag).body(result);
        } catch (Exception e) {
            log.error("Error fetching all board receipts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardReceipt> findById(@PathVariable("id") Long id, HttpServletRequest request) {
        log.info("Fetching board receipt id={}", id);
        BoardReceipt receipt = service.findById(id);
        try {
            String responseJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(receipt);
            String eTag = ETagUtil.generateETag(responseJson);
            String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);
            if (eTag.equals(ifNoneMatch)) {
                return ResponseEntity.status(304).eTag(eTag).build();
            }
            return ResponseEntity.ok().eTag(eTag).body(receipt);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/process")
    @Operation(summary = "Process board receipt with UTR number", 
               description = "Processes a board receipt by adding UTR number and changing status to VERIFIED")
    @Audited(action = "PROCESS_BOARD_RECEIPT", resourceType = "BOARD_RECEIPT")
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

    @PutMapping("/{id}")
    @Audited(action = "UPDATE_BOARD_RECEIPT", resourceType = "BOARD_RECEIPT")
    public ResponseEntity<BoardReceipt> update(@PathVariable("id") Long id, @RequestBody BoardReceipt boardReceipt) {
        log.info("Updating board receipt id={}", id);
        return ResponseEntity.ok(service.update(id, boardReceipt));
    }

    @DeleteMapping("/{id}")
    @Audited(action = "DELETE_BOARD_RECEIPT", resourceType = "BOARD_RECEIPT")
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
