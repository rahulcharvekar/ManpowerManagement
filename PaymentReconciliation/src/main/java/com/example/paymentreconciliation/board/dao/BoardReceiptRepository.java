package com.example.paymentreconciliation.board.dao;

import com.example.paymentreconciliation.board.entity.BoardReceipt;
import com.example.paymentreconciliation.board.entity.BoardReceiptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BoardReceiptRepository extends JpaRepository<BoardReceipt, Long> {
    
    Optional<BoardReceipt> findByBoardRef(String boardRef);
    
    Optional<BoardReceipt> findByEmployerRef(String employerRef);
    
    List<BoardReceipt> findByStatus(BoardReceiptStatus status);
    
    Page<BoardReceipt> findByStatus(BoardReceiptStatus status, Pageable pageable);
    
    List<BoardReceipt> findByMaker(String maker);
    
    // Find by status and date range
    @Query("SELECT b FROM BoardReceipt b WHERE b.status = :status AND b.date BETWEEN :startDate AND :endDate")
    Page<BoardReceipt> findByStatusAndDateBetween(
        @Param("status") BoardReceiptStatus status, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate, 
        Pageable pageable
    );
    
    // Find by date range only
    @Query("SELECT b FROM BoardReceipt b WHERE b.date BETWEEN :startDate AND :endDate")
    Page<BoardReceipt> findByDateBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate, 
        Pageable pageable
    );
}
