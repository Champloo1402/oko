package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.Review;
import com.oko.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovie(Movie movie);
    List<Review> findByUser(User user);
    Optional<Review> findByUserAndMovie(User user, Movie movie);
}
