package com.oko.controller;

import com.oko.dto.response.WatchedMovieResponse;
import com.oko.service.WatchedMovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/watched")
public class WatchedMovieController {

    private final WatchedMovieService watchedMovieService;

    @PostMapping("/{movieId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WatchedMovieResponse markAsWatched(@PathVariable Long movieId) {
        return watchedMovieService.markAsWatched(movieId);
    }

    @DeleteMapping("/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unmarkAsWatched(@PathVariable Long movieId) {
        watchedMovieService.unmarkAsWatched(movieId);
    }

    @GetMapping("/{movieId}/status")
    public boolean hasWatched(@PathVariable Long movieId) {
        return watchedMovieService.hasWatched(movieId);
    }

    @GetMapping("/count/{username}")
    public int getWatchedCount(@PathVariable String username) {
        return watchedMovieService.getWatchedCount(username);
    }
}