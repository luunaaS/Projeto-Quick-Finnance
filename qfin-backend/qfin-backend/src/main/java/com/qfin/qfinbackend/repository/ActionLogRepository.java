package com.qfin.qfinbackend.repository;

import com.qfin.qfinbackend.model.ActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {
    List<ActionLog> findByUserIdOrderByTimestampDesc(Long userId);
    Page<ActionLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
