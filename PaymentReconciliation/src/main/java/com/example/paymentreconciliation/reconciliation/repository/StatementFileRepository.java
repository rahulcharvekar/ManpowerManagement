package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.StatementFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatementFileRepository extends JpaRepository<StatementFile, Long> {
}
