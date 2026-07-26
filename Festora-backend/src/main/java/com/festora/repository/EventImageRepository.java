package com.festora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.festora.entity.Event;
import com.festora.entity.EventImage;

public interface EventImageRepository extends JpaRepository<EventImage, Long> {

}