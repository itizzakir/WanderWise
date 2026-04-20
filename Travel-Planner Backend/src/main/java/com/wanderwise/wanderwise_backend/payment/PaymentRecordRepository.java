package com.wanderwise.wanderwise_backend.payment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    boolean existsByPaymentCode(String paymentCode);

    List<PaymentRecord> findAllByOrderByPaidAtDesc();

    List<PaymentRecord> findAllByUserEmailOrderByPaidAtDesc(String userEmail);
}
