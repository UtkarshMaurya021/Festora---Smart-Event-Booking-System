package com.festora.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayVerifyResponse {
    private boolean verified;
    private String status;
    private String message;
    private String razorpayOrderId;
    private String razorpayPaymentId;
}
