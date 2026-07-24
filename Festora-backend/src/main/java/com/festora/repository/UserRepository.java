package com.festora.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.festora.entity.User;

public interface UserRepository extends JpaRepository<com.festora.entity.User, Long> {

    Optional<User> findByEmail(String email);

}