package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {

    private String orderId;

    private String key;

    private Integer amount;

    private String currency;

    private String name;

    private String email;

    private String phone;

}