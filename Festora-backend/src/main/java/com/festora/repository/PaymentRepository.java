package com.festora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.festora.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

}