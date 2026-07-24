package com.festora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.festora.entity.EventImage;

public interface EventImageRepository extends JpaRepository<EventImage, Long> {

}