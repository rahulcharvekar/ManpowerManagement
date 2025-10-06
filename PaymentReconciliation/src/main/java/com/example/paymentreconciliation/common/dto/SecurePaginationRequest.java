package com.example.paymentreconciliation.common.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Secure Pagination Request DTO with mandatory date range parameters
 * Ensures all paginated APIs have proper date filtering to prevent data exposure
 */
@Schema(description = "Secure pagination request with mandatory date range filtering")
public class SecurePaginationRequest {
    
    @NotNull(message = "Start date is mandatory for secure pagination")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Start date must be in YYYY-MM-DD format")
    @Schema(description = "Start date for filtering (YYYY-MM-DD) - MANDATORY", 
            example = "2024-01-01", required = true)
    private String startDate;
    
    @NotNull(message = "End date is mandatory for secure pagination")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "End date must be in YYYY-MM-DD format")
    @Schema(description = "End date for filtering (YYYY-MM-DD) - MANDATORY", 
            example = "2024-12-31", required = true)
    private String endDate;
    
    @Min(value = 0, message = "Page number must be 0 or greater")
    @Schema(description = "Page number (0-based)", example = "0", defaultValue = "0")
    private int page = 0;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @Schema(description = "Page size (max 100)", example = "20", defaultValue = "20")
    private int size = 20;
    
    @Schema(description = "Sort field", example = "createdAt")
    private String sortBy = "createdAt";
    
    @Pattern(regexp = "^(asc|desc)$", message = "Sort direction must be 'asc' or 'desc'")
    @Schema(description = "Sort direction", example = "desc", allowableValues = {"asc", "desc"})
    private String sortDir = "desc";
    
    // Session-based pagination token for tamper-proof pagination
    @Schema(description = "Optional pagination session token for secure navigation")
    private String sessionToken;
    
    // Constructors
    public SecurePaginationRequest() {}
    
    public SecurePaginationRequest(String startDate, String endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
    
    public SecurePaginationRequest(String startDate, String endDate, int page, int size) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.page = page;
        this.size = size;
    }
    
    // Getters and Setters
    public String getStartDate() {
        return startDate;
    }
    
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    
    public String getEndDate() {
        return endDate;
    }
    
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
    
    public String getSortDir() {
        return sortDir;
    }
    
    public void setSortDir(String sortDir) {
        this.sortDir = sortDir;
    }
    
    public String getSessionToken() {
        return sessionToken;
    }
    
    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }
    
    @Override
    public String toString() {
        return "SecurePaginationRequest{" +
                "startDate='" + startDate + '\'' +
                ", endDate='" + endDate + '\'' +
                ", page=" + page +
                ", size=" + size +
                ", sortBy='" + sortBy + '\'' +
                ", sortDir='" + sortDir + '\'' +
                ", sessionToken='" + (sessionToken != null ? "***" : null) + '\'' +
                '}';
    }
}
