package com.festora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.festora.entity.Booking;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBooking(Booking booking);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findAllByOrderByPaymentDateDesc();

    @Query("""
            SELECT COALESCE(SUM(p.amount),0)
            FROM Payment p
            WHERE p.status = :status
            """)
    Double sumAmountByStatus(@Param("status") PaymentStatus status);

}