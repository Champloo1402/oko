package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.Review;
import com.oko.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByMovie(Movie movie,  Pageable pageable);
    Page<Review> findByUser(User user,   Pageable pageable);
    Optional<Review> findByUserAndMovie(User user, Movie movie);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.movie = :movie")
    Optional<Double> findAverageRatingByMovie(Movie movie);
    void deleteByUser(User user);
    List<Review> findByUserInOrderByCreatedAtDesc(List<User> users, Pageable pageable);
    int countByUser(User user);

    void deleteByMovie(Movie movie);

    @Query("SELECT r.movie.id, AVG(r.rating) FROM Review r WHERE r.movie.id IN :movieIds GROUP BY r.movie.id")
    List<Object[]> findAverageRatingsByMovieIds(@Param("movieIds") List<Long> movieIds);
}
