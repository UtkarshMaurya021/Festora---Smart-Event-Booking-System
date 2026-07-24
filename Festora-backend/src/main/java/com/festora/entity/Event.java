package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    private String title;

    @Column(length = 3000)
    private String description;

    private LocalDateTime eventStartDatetime;

    private LocalDateTime eventEndDatetime;

    private Double price;

    private Integer totalSeats;

    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    private Organizer organizer;

    @ManyToOne
    private Category category;

    @ManyToOne
    private Venue venue;
}