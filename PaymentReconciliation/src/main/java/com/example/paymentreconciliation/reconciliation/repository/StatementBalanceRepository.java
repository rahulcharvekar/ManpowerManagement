package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.StatementBalance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatementBalanceRepository extends JpaRepository<StatementBalance, Long> {
}
