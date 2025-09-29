package com.example.paymentreconciliation.board.dao;

import com.example.paymentreconciliation.board.entity.BoardReconciliationReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardReconciliationReceiptRepository extends JpaRepository<BoardReconciliationReceipt, Long> {
    
    Optional<BoardReconciliationReceipt> findByEmployerReceiptNumber(String employerReceiptNumber);
    
    List<BoardReconciliationReceipt> findByStatus(String status);
    
    List<BoardReconciliationReceipt> findByReconciledBy(String reconciledBy);
    
    List<BoardReconciliationReceipt> findByTransactionReference(String transactionReference);
    
    Optional<BoardReconciliationReceipt> findByBoardReceiptNumber(String boardReceiptNumber);
}
