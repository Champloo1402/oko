package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.MovieCast;
import com.oko.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieCastRepository extends JpaRepository<MovieCast, Long> {
    List<MovieCast> findByMovie(Movie movie);
    List<MovieCast> findByPerson(Person person);
}
