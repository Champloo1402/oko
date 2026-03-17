package com.oko.controller;

import com.oko.dto.request.CreateListRequest;
import com.oko.dto.response.MovieListResponse;
import com.oko.service.MovieListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lists")
public class MovieListController {

    private final MovieListService movieListService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovieListResponse createList(@Valid @RequestBody CreateListRequest request) {
        return movieListService.createList(request);
    }

    @PostMapping("/{listId}/movies/{movieId}")
    public MovieListResponse addMovieToList(@PathVariable Long listId, @PathVariable Long movieId) {
        return movieListService.addMovieToList(listId, movieId);
    }

    @DeleteMapping("/{listId}/movies/{movieId}")
    public MovieListResponse removeMovieFromList(@PathVariable Long listId, @PathVariable Long movieId) {
        return movieListService.removeMovieFromList(listId, movieId);
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long listId) {
        movieListService.deleteList(listId);
    }

    @GetMapping("/user/{username}")
    public List<MovieListResponse> getUserLists(@PathVariable String username) {
        return movieListService.getUserLists(username);
    }

    @GetMapping("/{listId}")
    public MovieListResponse getListById(@PathVariable Long listId) {
        return movieListService.getListById(listId);
    }
}