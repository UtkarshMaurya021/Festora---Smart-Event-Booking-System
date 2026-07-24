package com.festora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="venue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long venueId;

    private String venueName;

    private String address;

    private String city;

    private String state;

    private String postalCode;

    private Integer capacity;

}