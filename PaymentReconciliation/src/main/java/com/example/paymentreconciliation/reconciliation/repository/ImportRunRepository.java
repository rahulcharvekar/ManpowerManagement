package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.ImportRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ImportRunRepository extends JpaRepository<ImportRun, Long> {
    Optional<ImportRun> findByFileHash(String fileHash);
}
