package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

}