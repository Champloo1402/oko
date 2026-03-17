package com.oko.repository;

import com.oko.entity.DiaryEntry;
import com.oko.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {
    Page<DiaryEntry> findByUserOrderByWatchedOnDesc(User user, Pageable pageable);
    void deleteByUser(User user);
    List<DiaryEntry> findByUserInOrderByWatchedOnDesc(List<User> users);
    int countByUser(User user);

}
