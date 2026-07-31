package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    @NotNull(message = "Booking is required")
    @OneToOne
    @JoinColumn(name="booking_id")
    private Booking booking;

    @NotBlank(message = "Ticket number is required")
    @Column(unique = true)
    private String ticketNumber;

    @NotBlank(message = "QR code path is required")
    private String qrCodePath;

    @NotNull(message = "Issue date is required")
    private LocalDateTime issueDate;

}