package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.MovieList;
import com.oko.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieListRepository extends JpaRepository<MovieList, Long> {
    List<MovieList> findByUserOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);
    List<MovieList> findByMoviesContaining(Movie movie);
}