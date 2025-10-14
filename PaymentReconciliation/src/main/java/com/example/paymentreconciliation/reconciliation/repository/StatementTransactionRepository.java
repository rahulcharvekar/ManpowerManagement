package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.StatementTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatementTransactionRepository extends JpaRepository<StatementTransaction, Long> {
}
