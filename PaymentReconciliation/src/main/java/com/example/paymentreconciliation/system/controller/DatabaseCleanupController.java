package com.example.paymentreconciliation.system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import com.example.paymentreconciliation.common.util.ETagUtil;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system/database")
@Tag(name = "Database Management", description = "Database cleanup and maintenance operations")
@SecurityRequirement(name = "Bearer Authentication")
public class DatabaseCleanupController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(DatabaseCleanupController.class);
    
    @Autowired
    private DataSource dataSource;

    @Operation(summary = "Clean all database tables", 
               description = "Executes the cleanup script to truncate all tables and reset auto-increment counters. USE WITH CAUTION!")
    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanupDatabase() {
        log.warn("DANGER: Database cleanup requested - this will delete ALL data!");
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            Map<String, Object> result = new HashMap<>();
            
            log.info("Starting database cleanup...");
            
            // Disable foreign key checks
            statement.execute("SET FOREIGN_KEY_CHECKS = 0");
            log.info("Disabled foreign key checks");
            
            // Clean all tables in the correct order (child tables first)
            String[] tables = {
                "board_receipts",
                "employer_payment_receipts", 
                "worker_payment_receipts",
                "worker_uploaded_data",
                "worker_payments",
                "uploaded_files"
            };
            
            int truncatedTables = 0;
            for (String table : tables) {
                try {
                    statement.execute("TRUNCATE TABLE " + table);
                    log.info("Truncated table: {}", table);
                    truncatedTables++;
                } catch (Exception e) {
                    log.error("Failed to truncate table {}: {}", table, e.getMessage());
                }
            }
            
            // Reset auto-increment counters
            for (String table : tables) {
                try {
                    statement.execute("ALTER TABLE " + table + " AUTO_INCREMENT = 1");
                    log.info("Reset auto-increment for table: {}", table);
                } catch (Exception e) {
                    log.error("Failed to reset auto-increment for table {}: {}", table, e.getMessage());
                }
            }
            
            // Re-enable foreign key checks
            statement.execute("SET FOREIGN_KEY_CHECKS = 1");
            log.info("Re-enabled foreign key checks");
            
            // Verify tables are empty
            Map<String, Integer> tableCounts = new HashMap<>();
            for (String table : tables) {
                try {
                    var rs = statement.executeQuery("SELECT COUNT(*) FROM " + table);
                    if (rs.next()) {
                        int count = rs.getInt(1);
                        tableCounts.put(table, count);
                        log.info("Table {} now has {} rows", table, count);
                    }
                } catch (Exception e) {
                    log.error("Failed to count rows in table {}: {}", table, e.getMessage());
                    tableCounts.put(table, -1);
                }
            }
            
            result.put("status", "success");
            result.put("message", "Database cleanup completed successfully");
            result.put("truncatedTables", truncatedTables);
            result.put("tableCounts", tableCounts);
            result.put("timestamp", java.time.LocalDateTime.now());
            
            log.info("Database cleanup completed successfully");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Database cleanup failed", e);
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Database cleanup failed: " + e.getMessage());
            error.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @Operation(summary = "Check table row counts", 
               description = "Returns the current row count for all main tables")
    @GetMapping("/table-counts")
    public ResponseEntity<?> getTableCounts(HttpServletRequest request) {
        log.info("Checking table row counts...");
        
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            String[] tables = {
                "worker_payments",
                "worker_uploaded_data", 
                "uploaded_files",
                "worker_payment_receipts",
                "employer_payment_receipts",
                "board_receipts"
            };
            
            Map<String, Integer> tableCounts = new HashMap<>();
            for (String table : tables) {
                try {
                    var rs = statement.executeQuery("SELECT COUNT(*) FROM " + table);
                    if (rs.next()) {
                        tableCounts.put(table, rs.getInt(1));
                    }
                } catch (Exception e) {
                    log.error("Failed to count rows in table {}: {}", table, e.getMessage());
                    tableCounts.put(table, -1);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("tableCounts", tableCounts);
            result.put("timestamp", java.time.LocalDateTime.now());
            
            String responseJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(result);
            String eTag = ETagUtil.generateETag(responseJson);
            String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);
            if (eTag.equals(ifNoneMatch)) {
                return ResponseEntity.status(304).eTag(eTag).build();
            }
            return ResponseEntity.ok().eTag(eTag).body(result);
            
        } catch (Exception e) {
            log.error("Failed to get table counts", e);
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to get table counts: " + e.getMessage());
            error.put("timestamp", java.time.LocalDateTime.now());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
