package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.WatchedMovie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WatchedMovieRepository extends JpaRepository<WatchedMovie, Long> {
    boolean existsByUserAndMovie(User user, Movie movie);
    void deleteByUserAndMovie(User user, Movie movie);
    int countByUser(User user);
    void deleteByUser(User user);
    List<WatchedMovie> findByUserInOrderByWatchedAtDesc(List<User> users);
    List<WatchedMovie> findByUser(User user);
}