package com.festora.entity;

public enum TicketStatus {

    VALID, // Issued, not yet used at the venue

    USED, // Scanned / verified at check-in

    CANCELLED // Booking was cancelled/refunded after issuance

}
