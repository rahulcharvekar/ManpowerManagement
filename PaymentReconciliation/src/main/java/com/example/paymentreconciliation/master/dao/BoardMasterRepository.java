package com.example.paymentreconciliation.master.dao;

import com.example.paymentreconciliation.master.entity.BoardMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardMasterRepository extends JpaRepository<BoardMaster, Long> {
    
    Optional<BoardMaster> findByBoardId(String boardId);
    
    Optional<BoardMaster> findByBoardCode(String boardCode);
    
    List<BoardMaster> findByStateName(String stateName);
    
    List<BoardMaster> findByStatus(String status);
    
    boolean existsByBoardId(String boardId);
    
    boolean existsByBoardCode(String boardCode);
}
