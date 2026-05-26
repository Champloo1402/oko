package com.oko.service;

import com.oko.dto.response.GenreResponse;
import com.oko.dto.response.MovieResponse;
import com.oko.entity.Genre;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.exception.ResourceNotFoundException;
import com.oko.external.tmdb.TmdbClient;
import com.oko.external.tmdb.dto.TmdbMovieResponse;
import com.oko.repository.MovieLikeRepository;
import com.oko.repository.MovieRepository;
import com.oko.repository.ReviewRepository;
import com.oko.repository.UserRepository;
import jakarta.persistence.criteria.Join;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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


    @Transactional(readOnly = true)
    public List<TmdbMovieResponse> searchMovie(String query) {
        return tmdbClient.searchMovies(query);

    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        User currentUser = getCurrentUserOrNull();
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
        return mapToMovieResponse(movie, currentUser);
    }

    @Transactional
    public MovieResponse syncMovie(Long tmdbId) {
        User currentUser = getCurrentUserOrNull();
        Movie movie = tmdbService.syncMovie(tmdbId);
        return mapToMovieResponse(movie,  currentUser);
    }


    public MovieResponse mapToMovieResponse(Movie movie, User currentUser){
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
        movieResponse.setTmdbRating(movie.getTmdbRating());

        Double avg = reviewRepository.findAverageRatingByMovie(movie).orElse(null);
        movieResponse.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);

        movieResponse.setLikeCount(movieLikeRepository.countByMovie(movie));

            movieResponse.setLikedByCurrentUser(
                    currentUser != null && movieLikeRepository.existsByUserAndMovie(currentUser, movie));

        return movieResponse;
    }

    public Movie getMovieEntityById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> filterMovies(String title, Integer year, String language, String genre) {
        User currentUser = getCurrentUserOrNull();

        Specification<Movie> spec = Specification.where((Specification<Movie>) null);

        if (title != null) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%")
                    );

        }

        if (year != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("releaseYear"), year)
                    );

        }
        if (language != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("language"), language)
                    );

        }
        if (genre != null) {
            spec = spec.and((root, query, cb) -> {
                    Join<Movie, Genre> genreJoin = root.join("genres");
                    return cb.equal(cb.lower(genreJoin.get("name")), genre.toLowerCase());
        });

        }

        return movieRepository.findAll(spec)
                .stream()
                .map(movie -> mapToMovieResponse(movie, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TmdbMovieResponse> getPopularMovies() {
        return tmdbClient.getPopularMovies();
    }

    private User getCurrentUserOrNull() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> mapToMovieResponses(List<Movie> movies, User currentUser) {

        if (movies.isEmpty()) return List.of();

        List<Long> movieIds = movies.stream()
                .map(Movie::getId)
                .toList();

        Map<Long, Double> ratingsMap = reviewRepository.findAverageRatingsByMovieIds(movieIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Double) row[1]
                ));

        Map<Long, Long> likeCountsMap = movieLikeRepository.findLikeCountsByMovieIds(movieIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        Set<Long> likedMovieIds = currentUser != null
                ? new HashSet<>(movieLikeRepository.findLikedMovieIdsByUser(currentUser, movieIds))
                : new HashSet<>();

        return movies.stream()
                .map(movie -> {
                    MovieResponse response = new MovieResponse();
                    response.setId(movie.getId());
                    response.setTmdbId(movie.getTmdbId());
                    response.setTitle(movie.getTitle());
                    response.setOriginalTitle(movie.getOriginalTitle());
                    response.setOverview(movie.getOverview());
                    response.setReleaseYear(movie.getReleaseYear());
                    response.setRuntimeMinutes(movie.getRuntimeMinutes());
                    response.setPosterUrl(movie.getPosterUrl());
                    response.setBackdropUrl(movie.getBackdropUrl());
                    response.setLanguage(movie.getLanguage());

                    List<GenreResponse> genres = movie.getGenres().stream()
                            .map(genre -> {
                                GenreResponse genreResponse = new GenreResponse();
                                genreResponse.setId(genre.getId());
                                genreResponse.setName(genre.getName());
                                return genreResponse;
                            })
                            .collect(Collectors.toList());
                    response.setGenres(genres);
                    response.setTmdbRating(movie.getTmdbRating());

                    Double avg = ratingsMap.get(movie.getId());
                    response.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : null);

                    Long likeCount = likeCountsMap.get(movie.getId());
                    response.setLikeCount(likeCount != null ? likeCount.intValue() : 0);

                    response.setLikedByCurrentUser(likedMovieIds.contains(movie.getId()));

                    return response;
                })
                .toList();
    }
}
