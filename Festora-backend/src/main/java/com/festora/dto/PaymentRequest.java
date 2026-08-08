package com.festora.dto;

import com.festora.entity.PaymentMethod;
import lombok.Data;

@Data
public class PaymentRequest {

    private Long bookingId;

    private String transactionId;

    private PaymentMethod paymentMethod;

    private String cardNumber;

    private String upiId;

}