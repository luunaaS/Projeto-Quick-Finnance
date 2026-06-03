package com.qfin.qfinbackend.service;

import com.qfin.qfinbackend.model.ActionLog;
import com.qfin.qfinbackend.repository.ActionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActionLogService {

    @Autowired
    private ActionLogRepository actionLogRepository;

    public void log(Long userId, String userEmail, String action, String details) {
        ActionLog log = new ActionLog(userId, userEmail, action, details);
        actionLogRepository.save(log);
    }

    public List<ActionLog> getLogsByUser(Long userId) {
        return actionLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<ActionLog> getAllLogs(int page, int size) {
        return actionLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size)).getContent();
    }
}
