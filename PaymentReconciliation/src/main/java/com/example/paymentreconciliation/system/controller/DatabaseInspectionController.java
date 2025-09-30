package com.example.paymentreconciliation.system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DatabaseInspectionController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/worker-payments-schema")
    public Map<String, Object> getWorkerPaymentsSchema() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> columns = new ArrayList<>();
        
        try (Connection conn = dataSource.getConnection()) {
            String sql = "DESCRIBE worker_payments";
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> column = new HashMap<>();
                column.put("field", rs.getString("Field"));
                column.put("type", rs.getString("Type"));
                column.put("null", rs.getString("Null"));
                column.put("key", rs.getString("Key"));
                column.put("default", rs.getString("Default"));
                column.put("extra", rs.getString("Extra"));
                columns.add(column);
            }
            
            result.put("columns", columns);
            result.put("status", "success");
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("status", "error");
        }
        
        return result;
    }

    @GetMapping("/test-status-update")
    public Map<String, Object> testStatusUpdate() {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection conn = dataSource.getConnection()) {
            // Try to update with different status values to see which ones work
            String[] testStatuses = {"A", "AB", "ABC", "ABCD", "ABCDE"};
            
            for (String status : testStatuses) {
                try {
                    String sql = "UPDATE worker_payments SET status = ? WHERE id = 1";
                    PreparedStatement stmt = conn.prepareStatement(sql);
                    stmt.setString(1, status);
                    int rowsAffected = stmt.executeUpdate();
                    result.put("status_" + status.length() + "_chars", "SUCCESS - " + rowsAffected + " rows affected");
                } catch (Exception e) {
                    result.put("status_" + status.length() + "_chars", "FAILED - " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("status", "error");
        }
        
        return result;
    }

    @GetMapping("/migrate-status-column")
    public Map<String, Object> migrateStatusColumn() {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection conn = dataSource.getConnection()) {
            // Check current column definition first
            String descSql = "DESCRIBE worker_payments";
            PreparedStatement descStmt = conn.prepareStatement(descSql);
            ResultSet descRs = descStmt.executeQuery();
            
            String currentType = "";
            while (descRs.next()) {
                if ("status".equals(descRs.getString("Field"))) {
                    currentType = descRs.getString("Type");
                    break;
                }
            }
            
            result.put("current_column_type", currentType);
            
            // Execute the migration
            String migrationSql = "ALTER TABLE worker_payments MODIFY COLUMN status VARCHAR(40) NOT NULL";
            PreparedStatement migrationStmt = conn.prepareStatement(migrationSql);
            migrationStmt.executeUpdate();
            
            result.put("migration_status", "SUCCESS");
            result.put("message", "Column successfully changed from " + currentType + " to VARCHAR(40)");
            
            // Verify the change
            PreparedStatement verifyStmt = conn.prepareStatement(descSql);
            ResultSet verifyRs = verifyStmt.executeQuery();
            
            String newType = "";
            while (verifyRs.next()) {
                if ("status".equals(verifyRs.getString("Field"))) {
                    newType = verifyRs.getString("Type");
                    break;
                }
            }
            
            result.put("new_column_type", newType);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("migration_status", "FAILED");
        }
        
        return result;
    }
}
