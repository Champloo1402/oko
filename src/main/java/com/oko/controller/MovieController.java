package com.oko.controller;

import com.oko.dto.response.MovieResponse;
import com.oko.external.tmdb.dto.TmdbMovieResponse;
import com.oko.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

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
}
