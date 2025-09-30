package com.example.paymentreconciliation.board.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "board_receipts")
public class BoardReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_reference", nullable = false, length = 64)
    private String boardRef;

    @Column(name = "employer_reference", nullable = false, length = 64)
    private String employerRef;

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "utr_number", nullable = false, length = 48)
    private String utrNumber;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "PENDING";

    @Column(name = "maker", nullable = false, length = 64)
    private String maker;

    @Column(name = "checker", length = 64)
    private String checker;

    @Column(name = "receipt_date", nullable = false)
    private LocalDate date;

    public BoardReceipt() {
    }

    public Long getId() {
        return id;
    }

    public String getBoardRef() {
        return boardRef;
    }

    public void setBoardRef(String boardRef) {
        this.boardRef = boardRef;
    }

    public String getEmployerRef() {
        return employerRef;
    }

    public void setEmployerRef(String employerRef) {
        this.employerRef = employerRef;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getUtrNumber() {
        return utrNumber;
    }

    public void setUtrNumber(String utrNumber) {
        this.utrNumber = utrNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
