package com.example.paymentreconciliation.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Standard error response")
public class ErrorResponse {
    @Schema(description = "Success flag", example = "false")
    private boolean success;

    @Schema(description = "Error message", example = "Validation failed")
    private String error;

    @Schema(description = "Error details")
    private Object details;

    @Schema(description = "Timestamp of error")
    private LocalDateTime timestamp;

    public ErrorResponse() {}

    public ErrorResponse(String error, Object details) {
        this.success = false;
        this.error = error;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public Object getDetails() { return details; }
    public void setDetails(Object details) { this.details = details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
