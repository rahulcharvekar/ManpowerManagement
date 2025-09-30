package com.example.paymentreconciliation.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database migration configuration for handling schema updates
 * that Hibernate ddl-auto doesn't handle well
 */
@Component
public class DatabaseMigrationConfig {
    
    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationConfig.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Run database migrations after application startup
     */
    @EventListener(ApplicationReadyEvent.class)
    public void runMigrations() {
        log.info("Running database migrations...");
        
        try {
            // Fix board_receipts status column size
            migrateStatusColumn();
            log.info("Database migrations completed successfully");
            
        } catch (Exception e) {
            log.error("Error during database migrations", e);
            // Don't fail the application startup for migration errors
        }
    }
    
    /**
     * Migrate the status column in board_receipts table to support PROCESSED status
     */
    private void migrateStatusColumn() {
        try {
            log.info("Checking and updating board_receipts.status column size...");
            
            // Check current column definition
            String checkColumnSql = "SELECT CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS " +
                                   "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'board_receipts' AND COLUMN_NAME = 'status'";
            
            Integer currentLength = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            log.info("Current status column length: {}", currentLength);
            
            if (currentLength != null && currentLength < 32) {
                log.info("Updating status column from VARCHAR({}) to VARCHAR(32)", currentLength);
                
                String alterColumnSql = "ALTER TABLE board_receipts MODIFY COLUMN status VARCHAR(32) NOT NULL";
                jdbcTemplate.execute(alterColumnSql);
                
                log.info("Successfully updated board_receipts.status column to VARCHAR(32)");
            } else {
                log.info("Status column already has sufficient size ({}), no migration needed", currentLength);
            }
            
        } catch (Exception e) {
            log.error("Error migrating status column", e);
            
            // Try alternative approach - force the column update
            try {
                log.info("Attempting direct column modification...");
                String alterColumnSql = "ALTER TABLE board_receipts MODIFY COLUMN status VARCHAR(32) NOT NULL";
                jdbcTemplate.execute(alterColumnSql);
                log.info("Direct column modification successful");
                
            } catch (Exception fallbackError) {
                log.error("Fallback column modification also failed", fallbackError);
                throw new RuntimeException("Unable to update status column size. Please run SQL manually: " +
                                         "ALTER TABLE board_receipts MODIFY COLUMN status VARCHAR(32) NOT NULL;");
            }
        }
    }
}
