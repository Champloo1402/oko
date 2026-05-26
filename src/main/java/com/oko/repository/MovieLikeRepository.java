package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.MovieLike;
import com.oko.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovieLikeRepository extends JpaRepository<MovieLike, Long> {
    boolean existsByUserAndMovie(User user, Movie movie);
    void deleteByUserAndMovie(User user, Movie movie);
    int countByMovie(Movie movie);
    void deleteByUser(User user);

    void deleteByMovie(Movie movie);

    @Query("SELECT l.movie.id, COUNT(l) FROM MovieLike l WHERE l.movie.id IN :movieIds GROUP BY l.movie.id")
    List<Object[]> findLikeCountsByMovieIds(@Param("movieIds") List<Long> movieIds);

    @Query("SELECT l.movie.id FROM MovieLike l WHERE l.user = :user AND l.movie.id IN :movieIds")
    List<Long> findLikedMovieIdsByUser(@Param("user") User user, @Param("movieIds") List<Long> movieIds);
}