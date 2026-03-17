package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.MovieLike;
import com.oko.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    boolean existsByUserAndMovie(User user, Movie movie);
    void deleteByUserAndMovie(User user, Movie movie);
    int countByMovie(Movie movie);
    void deleteByUser(User user);
}