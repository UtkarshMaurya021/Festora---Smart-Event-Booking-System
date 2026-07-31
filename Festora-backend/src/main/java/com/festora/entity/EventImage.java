package com.festora.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Image URL is required")
    @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
    @Column(nullable = false, length = 1000)
    private String imageUrl;

    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "event_id")
    @JsonIgnore
    private Event event;
}