package com.festora.dto;

import com.festora.entity.PaymentMethod;
import lombok.Data;

/**
 * Sent when the user submits the FestoraPay checkout form.
 * cardNumber / upiId are only used to decide the simulated outcome
 * (see PaymentService) -- nothing is ever charged for real.
 */
@Data
public class PaymentConfirmRequest {

    private Long bookingId;

    private String transactionId;

    private PaymentMethod paymentMethod;

    private String cardNumber;

    private String upiId;

}