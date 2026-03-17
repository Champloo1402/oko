package com.oko.service;

import com.oko.dto.response.WatchedMovieResponse;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.WatchedMovie;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.WatchedMovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WatchedMovieService {

    private final WatchedMovieRepository watchedMovieRepository;
    private final UserService userService;
    private final MovieService movieService;

    @Transactional
    public WatchedMovieResponse markAsWatched(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);

        if (watchedMovieRepository.existsByUserAndMovie(user, movie)) {
            throw new DuplicateResourceException("Movie already marked as watched");
        }

        WatchedMovie watched = new WatchedMovie();
        watched.setUser(user);
        watched.setMovie(movie);

        return mapToResponse(watchedMovieRepository.save(watched));
    }

    @Transactional
    public void unmarkAsWatched(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);

        if (!watchedMovieRepository.existsByUserAndMovie(user, movie)) {
            throw new ResourceNotFoundException("Movie not marked as watched");
        }

        watchedMovieRepository.deleteByUserAndMovie(user, movie);
    }

    @Transactional(readOnly = true)
    public boolean hasWatched(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);
        return watchedMovieRepository.existsByUserAndMovie(user, movie);
    }

    @Transactional(readOnly = true)
    public int getWatchedCount(String username) {
        User user = userService.getUserByUsername(username);
        return watchedMovieRepository.countByUser(user);
    }

    private WatchedMovieResponse mapToResponse(WatchedMovie watched) {
        WatchedMovieResponse response = new WatchedMovieResponse();
        response.setId(watched.getId());
        response.setMovie(movieService.mapToMovieResponse(watched.getMovie()));
        response.setWatchedAt(watched.getWatchedAt());
        return response;
    }
}