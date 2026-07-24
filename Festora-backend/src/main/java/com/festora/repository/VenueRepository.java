package com.festora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.festora.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {

}