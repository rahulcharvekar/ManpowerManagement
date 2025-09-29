package com.example.paymentreconciliation.worker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "worker_payments")
public class WorkerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "worker_reference", nullable = false, length = 64)
    private String workerRef;

    @Column(name = "registration_id", nullable = false, length = 64)
    private String regId;

    @Column(name = "worker_name", nullable = false, length = 120)
    private String name;

    @Column(name = "toli", nullable = false, length = 64)
    private String toli;

    @Column(name = "aadhar", nullable = false, length = 16)
    private String aadhar;

    @Column(name = "pan", nullable = false, length = 16)
    private String pan;

    @Column(name = "bank_account", nullable = false, length = 34)
    private String bankAccount;

    @Column(name = "payment_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal paymentAmount;


    @Column(name = "request_reference_number", nullable = false, unique = true, length = 40)
    private String requestReferenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WorkerPaymentStatus status = WorkerPaymentStatus.UPLOADED;

    @Column(name = "receipt_number", length = 40)
    private String receiptNumber;
    
    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public WorkerPayment() {
    }

    @PrePersist
    public void ensureRequestReferenceNumber() {
        if (Objects.isNull(requestReferenceNumber) || requestReferenceNumber.isBlank()) {
            requestReferenceNumber = "WRK-" + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 12)
                    .toUpperCase();
        }
    }

    public Long getId() {
        return id;
    }

    public String getWorkerRef() {
        return workerRef;
    }

    public void setWorkerRef(String workerRef) {
        this.workerRef = workerRef;
    }

    public String getRegId() {
        return regId;
    }

    public void setRegId(String regId) {
        this.regId = regId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getToli() {
        return toli;
    }

    public void setToli(String toli) {
        this.toli = toli;
    }

    public String getAadhar() {
        return aadhar;
    }

    public void setAadhar(String aadhar) {
        this.aadhar = aadhar;
    }

    public String getPan() {
        return pan;
    }

    public void setPan(String pan) {
        this.pan = pan;
    }

    public String getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getRequestReferenceNumber() {
        return requestReferenceNumber;
    }

    public void setRequestReferenceNumber(String requestReferenceNumber) {
        this.requestReferenceNumber = requestReferenceNumber;
    }

    public WorkerPaymentStatus getStatus() {
        return status;
    }

    public void setStatus(WorkerPaymentStatus status) {
        this.status = status;
    }
}
