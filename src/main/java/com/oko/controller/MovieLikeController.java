package com.oko.controller;

import com.oko.service.MovieLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movies")
public class MovieLikeController {

    private final MovieLikeService movieLikeService;

    @PostMapping("/{movieId}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void likeMovie(@PathVariable Long movieId) {
        movieLikeService.likeMovie(movieId);
    }

    @DeleteMapping("/{movieId}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlikeMovie(@PathVariable Long movieId) {
        movieLikeService.unlikeMovie(movieId);
    }

    @GetMapping("/{movieId}/like/status")
    public boolean hasLiked(@PathVariable Long movieId) {
        return movieLikeService.hasLiked(movieId);
    }
}