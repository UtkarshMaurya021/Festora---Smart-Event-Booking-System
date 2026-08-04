package com.festora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.festora.entity.EmailLog;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findAllByOrderBySentAtDesc();
}
