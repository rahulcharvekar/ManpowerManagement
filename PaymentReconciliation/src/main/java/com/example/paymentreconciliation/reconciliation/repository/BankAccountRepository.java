package com.example.paymentreconciliation.reconciliation.repository;

import com.example.paymentreconciliation.reconciliation.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNoAndCurrency(String accountNo, String currency);
}
