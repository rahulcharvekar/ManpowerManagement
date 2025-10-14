package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.ImportError;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportErrorRepository extends JpaRepository<ImportError, Long> {
}
