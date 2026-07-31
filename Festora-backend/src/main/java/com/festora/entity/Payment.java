package com.festora.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    // NOTE: not @NotBlank -- a Payment row is created (PENDING, no
    // transactionId yet) as soon as a booking is made; the transaction id is
    // only minted later when checkout starts (see PaymentService.createOrder).
    @Column(unique = true)
    private String transactionId;

    // NOTE: not @NotNull -- unset until the user picks a method at checkout.
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount cannot be negative")
    private Double amount;

    @NotNull(message = "Payment date is required")
    private LocalDateTime paymentDate;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @NotNull(message = "Booking is required")
    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
}