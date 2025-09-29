package com.example.paymentreconciliation.reconciliation.controller;

import com.example.paymentreconciliation.board.entity.BoardReconciliationReceipt;
import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.reconciliation.service.BoardReconciliationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/board/reconciliation")
@CrossOrigin
@Tag(name = "Board Reconciliation", description = "APIs for board level payment reconciliation against MT940 statements")
public class BoardReconciliationController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(BoardReconciliationController.class);
    
    @Autowired
    private BoardReconciliationService boardReconciliationService;
    
    /**
     * Get all validated employer receipts available for board reconciliation
     */
    @GetMapping("/pending-receipts")
    @Operation(summary = "Get validated employer receipts pending reconciliation",
               description = "Retrieve all employer receipts that have been validated and are available for board reconciliation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved pending receipts"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<EmployerPaymentReceipt>> getPendingReceiptsForReconciliation() {
        try {
            log.info("API call - Get pending employer receipts for board reconciliation");
            List<EmployerPaymentReceipt> pendingReceipts = boardReconciliationService.getValidatedReceiptsForReconciliation();
            log.info("Found {} pending receipts for board reconciliation", pendingReceipts.size());
            return ResponseEntity.ok(pendingReceipts);
        } catch (Exception e) {
            log.error("Error fetching pending receipts for reconciliation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Reconcile an employer receipt against MT940 statement
     */
    @PostMapping("/reconcile")
    @Operation(summary = "Reconcile employer receipt against MT940 statement",
               description = "Match an employer receipt with MT940 end-of-day statement data")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reconciliation completed successfully"),
        @ApiResponse(responseCode = "400", description = "Bad request - invalid parameters"),
        @ApiResponse(responseCode = "404", description = "Employer receipt not found"),
        @ApiResponse(responseCode = "409", description = "Receipt already reconciled"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> reconcileEmployerReceipt(
            @Parameter(description = "Employer receipt number to reconcile", required = true)
            @RequestParam String employerReceiptNumber,
            @Parameter(description = "Board user performing reconciliation", required = true)
            @RequestParam String reconciledBy) {
        
        try {
            log.info("API call - Reconcile employer receipt: {} by user: {}", employerReceiptNumber, reconciledBy);
            
            if (employerReceiptNumber == null || employerReceiptNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employer receipt number is required"));
            }
            
            if (reconciledBy == null || reconciledBy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reconciled by user is required"));
            }
            
            BoardReconciliationReceipt reconciliationResult = 
                boardReconciliationService.reconcileEmployerReceipt(employerReceiptNumber, reconciledBy);
            
            log.info("Reconciliation completed - Board receipt: {} Status: {}", 
                    reconciliationResult.getBoardReceiptNumber(), reconciliationResult.getStatus());
            
            return ResponseEntity.ok(reconciliationResult);
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                log.warn("Employer receipt not found: {}", employerReceiptNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            } else if (e.getMessage().contains("already reconciled")) {
                log.warn("Employer receipt already reconciled: {}", employerReceiptNumber);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", e.getMessage()));
            } else {
                log.error("Error during reconciliation", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Reconciliation failed: " + e.getMessage()));
            }
        } catch (Exception e) {
            log.error("Unexpected error during reconciliation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Get all board reconciliation receipts
     */
    @GetMapping("/receipts")
    @Operation(summary = "Get all board reconciliation receipts",
               description = "Retrieve all board reconciliation receipts with optional status filter")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved reconciliation receipts"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<BoardReconciliationReceipt>> getBoardReconciliationReceipts(
            @Parameter(description = "Filter by reconciliation status (RECONCILED, FAILED)")
            @RequestParam(required = false) String status) {
        
        try {
            log.info("API call - Get board reconciliation receipts with status filter: {}", status);
            
            List<BoardReconciliationReceipt> receipts;
            if (status != null && !status.trim().isEmpty()) {
                receipts = boardReconciliationService.getBoardReconciliationsByStatus(status.trim().toUpperCase());
            } else {
                receipts = boardReconciliationService.getAllBoardReconciliations();
            }
            
            log.info("Found {} board reconciliation receipts", receipts.size());
            return ResponseEntity.ok(receipts);
            
        } catch (Exception e) {
            log.error("Error fetching board reconciliation receipts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get board reconciliation receipts by reconciled user
     */
    @GetMapping("/receipts/by-user/{reconciledBy}")
    @Operation(summary = "Get reconciliation receipts by user",
               description = "Retrieve all reconciliation receipts processed by a specific board user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user's reconciliation receipts"),
        @ApiResponse(responseCode = "400", description = "Bad request - invalid user parameter"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getBoardReconciliationReceiptsByUser(
            @Parameter(description = "Board user who performed reconciliation", required = true)
            @PathVariable String reconciledBy) {
        
        try {
            log.info("API call - Get board reconciliation receipts by user: {}", reconciledBy);
            
            if (reconciledBy == null || reconciledBy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reconciled by user is required"));
            }
            
            List<BoardReconciliationReceipt> receipts = 
                boardReconciliationService.getBoardReconciliationsByUser(reconciledBy);
            
            log.info("Found {} board reconciliation receipts for user: {}", receipts.size(), reconciledBy);
            return ResponseEntity.ok(receipts);
            
        } catch (Exception e) {
            log.error("Error fetching board reconciliation receipts by user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
