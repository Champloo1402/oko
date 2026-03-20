package com.oko.controller;

import com.oko.dto.response.MovieCastResponse;
import com.oko.dto.response.PersonResponse;
import com.oko.external.tmdb.dto.TmdbPersonMovieCreditsResponse;
import com.oko.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/people")
public class PersonController {

    private final PersonService personService;

    @GetMapping("/{id}")
    public PersonResponse getPersonById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    @GetMapping("/{id}/filmography")
    public List<MovieCastResponse> getPersonFilmography(@PathVariable Long id) {
        return personService.getPersonFilmography(id);
    }

    @GetMapping("/{id}/tmdb-filmography")
    public TmdbPersonMovieCreditsResponse getTmdbFilmography(@PathVariable Long id) {
        return personService.getTmdbFilmography(id);
    }
}