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

    // The rest are populated only on SUCCESS, so the frontend can render
    // the QR ticket straight after payment without a second round trip.
    private String qrCodePath;

    private Long bookingId;

    private String eventTitle;

    private String venueName;

    private Integer quantity;

}