package com.example.paymentreconciliation.worker.entity;

/**
 * Status enum for tracking worker payment records through the processing workflow
 */
public enum WorkerPaymentStatus {
    UPLOADED,           // Initial status when record is loaded from file
    VALIDATED,          // Record passed validation
    FAILED,             // Record failed validation
    PROCESSED,          // Record was successfully processed
    PAYMENT_REQUESTED,  // Receipt has been generated and payment is requested  
    PAYMENT_INITIATED,  // Payment has been initiated by employer after receipt validation
    PAYMENT_PROCESSED,  // Payment has been successfully processed and completed
    GENERATED,          // Receipt has been generated for the payment
    ERROR               // Record encountered an error during processing
}
