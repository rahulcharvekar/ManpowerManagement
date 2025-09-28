package com.example.paymentreconciliation.board.dao;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardReceiptRepository extends JpaRepository<BoardReceipt, Long> {
}
