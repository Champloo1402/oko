package com.oko.controller;

import com.oko.dto.response.MovieCastResponse;
import com.oko.dto.response.MovieResponse;
import com.oko.external.tmdb.dto.TmdbMovieResponse;
import com.oko.service.MovieService;
import com.oko.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final PersonService personService;

    @GetMapping("/search")
    public List<TmdbMovieResponse> searchMovie(@RequestParam String query) {
        return movieService.searchMovie(query);
    }

    @GetMapping("/{id}")
    public MovieResponse getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id);

    }

    @PostMapping("/sync/{tmdbId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieResponse syncMovie(@PathVariable Long tmdbId) {
        return movieService.syncMovie(tmdbId);

    }

    @GetMapping("/{id}/cast")
    public List<MovieCastResponse> getMovieCast(@PathVariable Long id) {
        return personService.getMovieCast(id);
    }

    @GetMapping("/filter")
    public List<MovieResponse> filterMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String genre) {
        return movieService.filterMovies(title, year, language, genre);
    }

    @GetMapping("/popular")
    public List<TmdbMovieResponse> getPopularMovies() {
        return movieService.getPopularMovies();
    }

}
