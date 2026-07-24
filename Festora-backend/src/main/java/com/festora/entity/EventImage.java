package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
public class EventImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    private String imageUrl;

    private Boolean isPrimary;

    private LocalDateTime uploadedAt;

    @ManyToOne
    private Event event;

}