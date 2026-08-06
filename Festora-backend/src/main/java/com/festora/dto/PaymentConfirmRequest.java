package com.festora.dto;

import com.festora.entity.PaymentMethod;
import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private Long bookingId;
    private String transactionId;
    private PaymentMethod paymentMethod;
    private String cardNumber;
    private String upiId;

    // Razorpay Gateway Verification parameters
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}