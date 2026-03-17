package com.oko.service;

import com.oko.dto.response.GenreResponse;
import com.oko.dto.response.MovieResponse;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.exception.ResourceNotFoundException;
import com.oko.external.tmdb.TmdbClient;
import com.oko.external.tmdb.dto.TmdbMovieResponse;
import com.oko.repository.MovieLikeRepository;
import com.oko.repository.MovieRepository;
import com.oko.repository.ReviewRepository;
import com.oko.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;
    private final TmdbClient tmdbClient;
    private final ReviewRepository reviewRepository;
    private final MovieLikeRepository movieLikeRepository;
    private final UserRepository userRepository;


    public List<TmdbMovieResponse> searchMovie(String query) {
        return tmdbClient.searchMovies(query);

    }

    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        return mapToMovieResponse(movie);
    }

    public MovieResponse syncMovie(Long tmdbId) {
        Movie movie = tmdbService.syncMovie(tmdbId);
        return mapToMovieResponse(movie);
    }

    public MovieResponse mapToMovieResponse(Movie movie){
        MovieResponse movieResponse = new MovieResponse();
        movieResponse.setId(movie.getId());
        movieResponse.setTmdbId(movie.getTmdbId());
        movieResponse.setTitle(movie.getTitle());
        movieResponse.setOriginalTitle(movie.getOriginalTitle());
        movieResponse.setOverview(movie.getOverview());
        movieResponse.setReleaseYear(movie.getReleaseYear());
        movieResponse.setRuntimeMinutes(movie.getRuntimeMinutes());
        movieResponse.setPosterUrl(movie.getPosterUrl());
        movieResponse.setBackdropUrl(movie.getBackdropUrl());
        movieResponse.setLanguage(movie.getLanguage());
        List<GenreResponse> genres = movie.getGenres().stream()
                .map(genre -> {
                    GenreResponse genreResponse = new GenreResponse();
                    genreResponse.setId(genre.getId());
                    genreResponse.setName(genre.getName());
                    return genreResponse;
                })
                .collect(Collectors.toList());
        movieResponse.setGenres(genres);

        Double avg = reviewRepository.findAverageRatingByMovie(movie).orElse(null);
        movieResponse.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);

        movieResponse.setLikeCount(movieLikeRepository.countByMovie(movie));

        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User currentUser = userRepository.findByUsername(username).orElse(null);
            movieResponse.setLikedByCurrentUser(
                    currentUser != null && movieLikeRepository.existsByUserAndMovie(currentUser, movie));
        } catch (Exception e) {
            movieResponse.setLikedByCurrentUser(false);
        }
        return movieResponse;
    }

    public Movie getMovieEntityById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
    }
}
