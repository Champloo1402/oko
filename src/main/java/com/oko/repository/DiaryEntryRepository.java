package com.oko.repository;

import com.oko.entity.DiaryEntry;
import com.oko.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    List<DiaryEntry> findByUserOrderByWatchedOnDesc(User user);
}
