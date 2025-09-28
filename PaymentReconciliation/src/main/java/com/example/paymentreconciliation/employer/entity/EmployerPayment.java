package com.example.paymentreconciliation.employer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employer_payments")
public class EmployerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employer_reference", nullable = false, length = 64)
    private String employerRefNumber;

    @Column(name = "worker_reference", nullable = false, length = 64)
    private String workerRef;

    @Column(name = "toli", nullable = false, length = 64)
    private String toli;

    @Column(name = "bank_utr", nullable = false, length = 48)
    private String bankUtr;

    @Column(name = "payment_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal paymentAmount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "maker", nullable = false, length = 64)
    private String maker;

    @Column(name = "checker", length = 64)
    private String checker;

    public EmployerPayment() {
    }

    public Long getId() {
        return id;
    }

    public String getEmployerRefNumber() {
        return employerRefNumber;
    }

    public void setEmployerRefNumber(String employerRefNumber) {
        this.employerRefNumber = employerRefNumber;
    }

    public String getWorkerRef() {
        return workerRef;
    }

    public void setWorkerRef(String workerRef) {
        this.workerRef = workerRef;
    }

    public String getToli() {
        return toli;
    }

    public void setToli(String toli) {
        this.toli = toli;
    }

    public String getBankUtr() {
        return bankUtr;
    }

    public void setBankUtr(String bankUtr) {
        this.bankUtr = bankUtr;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getMaker() {
        return maker;
    }

    public void setMaker(String maker) {
        this.maker = maker;
    }

    public String getChecker() {
        return checker;
    }

    public void setChecker(String checker) {
        this.checker = checker;
    }
}
