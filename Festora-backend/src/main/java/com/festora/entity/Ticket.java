package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name="booking_id")
    private Booking booking;

    @Column(unique = true)
    private String ticketNumber;

    private String qrCodePath;

    private LocalDateTime issueDate;

}