package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitResponse {

    private String transactionId;

    private Double amount;

    private String currency;

    private Long bookingId;

    private String eventTitle;

    private Integer quantity;

    private String name;

    private String email;

    private String phone;

}