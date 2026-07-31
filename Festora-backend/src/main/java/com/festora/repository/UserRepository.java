package com.festora.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, Status status);

    List<User> findByRoleAndStatus(Role role, Status status);
}