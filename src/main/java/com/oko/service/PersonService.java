package com.oko.service;

import com.oko.dto.response.MovieCastResponse;
import com.oko.dto.response.PersonResponse;
import com.oko.entity.MovieCast;
import com.oko.entity.Person;
import com.oko.exception.ResourceNotFoundException;
import com.oko.external.tmdb.TmdbClient;
import com.oko.external.tmdb.dto.TmdbPersonMovieCreditsResponse;
import com.oko.repository.MovieCastRepository;
import com.oko.repository.MovieRepository;
import com.oko.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.oko.entity.Movie;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final MovieCastRepository movieCastRepository;
    private final MovieRepository movieRepository;
    private final MovieService movieService;
    private final TmdbClient tmdbClient;

    @Transactional(readOnly = true)
    public PersonResponse getPersonById(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
        return mapToPersonResponse(person);
    }

    @Transactional(readOnly = true)
    public List<MovieCastResponse> getMovieCast(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        return movieCastRepository.findByMovie(movie)
                .stream()
                .map(this::mapToCastResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovieCastResponse> getPersonFilmography(Long personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
        return movieCastRepository.findByPerson(person)
                .stream()
                .map(this::mapToCastResponse)
                .toList();
    }

    public PersonResponse mapToPersonResponse(Person person) {
        PersonResponse response = new PersonResponse();
        response.setId(person.getId());
        response.setName(person.getName());
        response.setPhotoUrl(person.getPhotoUrl());
        response.setBiography(person.getBiography());
        return response;
    }

    public TmdbPersonMovieCreditsResponse getTmdbFilmography(Long personId) {
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));

        if (person.getTmdbId() == null) {
            TmdbPersonMovieCreditsResponse empty = new TmdbPersonMovieCreditsResponse();
            empty.setCast(new ArrayList<>());
            empty.setCrew(new ArrayList<>());
            return empty;
        }

        return tmdbClient.getPersonMovieCredits(person.getTmdbId());
    }

    private MovieCastResponse mapToCastResponse(MovieCast cast) {
        MovieCastResponse response = new MovieCastResponse();
        response.setId(cast.getId());
        response.setPerson(mapToPersonResponse(cast.getPerson()));
        response.setCharacterName(cast.getCharacterName());
        response.setRoleType(cast.getRoleType().name());
        response.setOrderIndex(cast.getOrderIndex());
        response.setMovie(movieService.mapToMovieResponse(cast.getMovie()));
        return response;
    }
}