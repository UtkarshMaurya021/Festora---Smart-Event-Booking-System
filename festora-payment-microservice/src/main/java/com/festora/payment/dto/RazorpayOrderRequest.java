package com.festora.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderRequest {
    private Long bookingId;
    private Double amount;
    private String eventTitle;
    private String userName;
    private String userEmail;
    private String userPhone;
}
