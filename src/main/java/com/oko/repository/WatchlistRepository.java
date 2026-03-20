package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.WatchlistEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {
    Page<WatchlistEntry> findByUser(User user, Pageable pageable);
    Optional<WatchlistEntry> findByUserAndMovie(User user, Movie movie);
    boolean existsByUserAndMovie(User user, Movie movie);
    void deleteByUser(User user);

    void deleteByMovie(Movie movie);
}
