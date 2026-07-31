package com.festora.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event")
public class Event {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long eventId;

	@NotBlank(message = "Title is required")
	@Size(max = 150, message = "Title cannot exceed 150 characters")
	private String title;

	@Size(max = 3000, message = "Description cannot exceed 3000 characters")
	@Column(length = 3000)
	private String description;

	@NotNull(message = "Event start date/time is required")
	private LocalDateTime eventStartDatetime;

	@NotNull(message = "Event end date/time is required")
	private LocalDateTime eventEndDatetime;

	@NotNull(message = "Price is required")
	@PositiveOrZero(message = "Price cannot be negative")
	private Double price;

	@NotNull(message = "Total seats is required")
	@Positive(message = "Total seats must be greater than 0")
	private Integer totalSeats;

	@PositiveOrZero(message = "Available seats cannot be negative")
	private Integer availableSeats;

	@NotNull(message = "Status is required")
	@Enumerated(EnumType.STRING)
	private Status status;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@NotNull(message = "Organizer is required")
	@ManyToOne
	@JoinColumn(name = "organizer_id")
	private Organizer organizer;

	@NotNull(message = "Category is required")
	@ManyToOne
	@JoinColumn(name = "category_id")
	private Category category;

	@NotNull(message = "Venue is required")
	@ManyToOne
	@JoinColumn(name = "venue_id")
	private Venue venue;

	@OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<EventImage> images = new ArrayList<>();
}