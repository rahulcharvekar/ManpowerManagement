package com.example.paymentreconciliation.board.dao;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardReceiptRepository extends JpaRepository<BoardReceipt, Long> {
    // All read operations now handled by BoardReceiptQueryDao
    // Only JPA save operations remain for WRITE operations
}
