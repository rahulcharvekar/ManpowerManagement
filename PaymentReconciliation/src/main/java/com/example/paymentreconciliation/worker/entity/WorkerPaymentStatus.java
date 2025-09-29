package com.example.paymentreconciliation.worker.entity;

/**
 * Status enum for tracking worker payment records through the processing workflow
 */
public enum WorkerPaymentStatus {
    UPLOADED,      // Initial status when record is loaded from file
    VALIDATED,     // Record passed validation
    FAILED,        // Record failed validation
    PROCESSED,     // Record was successfully processed
    ERROR          // Record encountered an error during processing
}
