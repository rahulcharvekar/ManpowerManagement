package com.example.paymentreconciliation.system.controller;

import com.example.paymentreconciliation.utilities.database.DatabaseCleanupUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
@Profile("!prod")
@Tag(name = "System Management", description = "System administration and testing utilities")
public class SystemController {

    @Autowired
    private DatabaseCleanupUtil databaseCleanupUtil;

    @PostMapping("/cleanup-database")
    @Operation(
        summary = "Clean database for testing", 
        description = "WARNING: This will delete ALL data in all tables! Use only for testing."
    )
    public ResponseEntity<?> cleanupDatabase() {
        try {
            databaseCleanupUtil.cleanAllTables();
            databaseCleanupUtil.verifyCleanup();
            
            return ResponseEntity.ok(Map.of(
                "message", "Database cleanup completed successfully",
                "warning", "ALL DATA HAS BEEN DELETED from all tables",
                "status", "success"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Database cleanup failed: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }

    @GetMapping("/verify-cleanup")
    @Operation(summary = "Verify database cleanup", description = "Check row counts in all tables")
    public ResponseEntity<?> verifyCleanup() {
        try {
            databaseCleanupUtil.verifyCleanup();
            return ResponseEntity.ok(Map.of(
                "message", "Check server logs for row counts",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Verification failed: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }

    @PostMapping("/drop-unique-constraint")
    @Operation(summary = "Drop unique constraint", description = "Drop unique constraint on request_reference_number")
    public ResponseEntity<?> dropUniqueConstraint() {
        try {
            databaseCleanupUtil.dropUniqueConstraint();
            return ResponseEntity.ok(Map.of(
                "message", "Unique constraint dropped successfully",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to drop constraint: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }

    @GetMapping("/schema/worker-payments")
    @Operation(summary = "Show worker payments schema", description = "Display the worker_payments table structure")
    public ResponseEntity<?> showWorkerPaymentsSchema() {
        try {
            databaseCleanupUtil.showWorkerPaymentsSchema();
            return ResponseEntity.ok(Map.of(
                "message", "Check server logs for schema details",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Schema display failed: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }

    @PostMapping("/migrate/status-column")
    @Operation(summary = "Update status column size", description = "Migrate worker_payments status column to VARCHAR(40)")
    public ResponseEntity<?> updateStatusColumn() {
        try {
            databaseCleanupUtil.updateStatusColumnSize();
            return ResponseEntity.ok(Map.of(
                "message", "Status column updated to VARCHAR(40) successfully",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Status column migration failed: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }

    @PostMapping("/migrate/add-created-at")
    @Operation(summary = "Add created_at column", description = "Add created_at timestamp column to worker_payments table with indexes")
    public ResponseEntity<?> addCreatedAtColumn() {
        try {
            databaseCleanupUtil.addCreatedAtColumn();
            return ResponseEntity.ok(Map.of(
                "message", "Successfully added created_at column to worker_payments table",
                "details", "Column added with TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
                "indexes", "Created indexes for date-based queries (created_at, status+created_at, receipt+created_at)",
                "status", "success"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Created_at column migration failed: " + e.getMessage(),
                "status", "failed"
            ));
        }
    }
}
