package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {

    private String status;   // SUCCESS or FAILED

    private String message;

    private String ticketNumber; // populated only on SUCCESS

}