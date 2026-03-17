package com.oko.service;

import com.oko.entity.Genre;
import com.oko.entity.Movie;
import com.oko.external.tmdb.TmdbClient;
import com.oko.external.tmdb.dto.TmdbGenreResponse;
import com.oko.external.tmdb.dto.TmdbMovieDetailResponse;
import com.oko.repository.GenreRepository;
import com.oko.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TmdbService {

    private final TmdbClient tmdbClient;
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    @Transactional
    public Movie syncMovie(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    Movie movie = mapToMovie(tmdbClient.getMovieById(tmdbId));
                    return movieRepository.save(movie);
        });

    }

    private Movie mapToMovie(TmdbMovieDetailResponse response) {
        Movie movie = new Movie();
        movie.setTmdbId(response.getId());
        movie.setTitle(response.getTitle());
        movie.setOriginalTitle(response.getOriginalTitle());
        movie.setOverview(response.getOverview());
        if (response.getReleaseDate() != null && !response.getReleaseDate().isBlank()) {
            movie.setReleaseYear(Integer.parseInt(response.getReleaseDate().substring(0, 4)));
        }
        movie.setRuntimeMinutes(response.getRuntime());
        movie.setPosterUrl("https://image.tmdb.org/t/p/w500" + response.getPosterPath());
        movie.setBackdropUrl("https://image.tmdb.org/t/p/w500" + response.getBackdropPath());
        movie.setLanguage(response.getOriginalLanguage());
        Set<Genre> genres = response.getGenres().stream()
                .map(this::findOrCreateGenre)
                .collect(Collectors.toSet());
        movie.setGenres(genres);
        return movie;
    }

    private Genre findOrCreateGenre(TmdbGenreResponse tmdbGenre) {
        return genreRepository.findByName(tmdbGenre.getName())
                .orElseGet(() -> {
                    Genre genre = new Genre();
                    genre.setName(tmdbGenre.getName());
                    return genreRepository.save(genre);
                });
    }
}
