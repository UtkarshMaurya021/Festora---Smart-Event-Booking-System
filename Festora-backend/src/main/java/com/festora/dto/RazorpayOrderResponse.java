package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private String keyId;
    private Long amount;
    private String currency;
    private Long bookingId;
    private String eventTitle;
    private String userName;
    private String userEmail;
    private String userPhone;
}
