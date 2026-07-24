package com.festora.repository;

import com.festora.entity.Organizer;
import com.festora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizerRepository extends JpaRepository<Organizer,Long>{

    Optional<Organizer> findByUser(User user);

}