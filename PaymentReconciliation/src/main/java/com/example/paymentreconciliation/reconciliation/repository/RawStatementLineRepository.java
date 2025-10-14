package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.RawStatementLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RawStatementLineRepository extends JpaRepository<RawStatementLine, Long> {
}
