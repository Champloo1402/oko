package com.oko.service;

import com.oko.entity.Genre;
import com.oko.entity.Movie;
import com.oko.entity.MovieCast;
import com.oko.entity.Person;
import com.oko.external.tmdb.TmdbClient;
import com.oko.external.tmdb.dto.TmdbCastResponse;
import com.oko.external.tmdb.dto.TmdbCreditsResponse;
import com.oko.external.tmdb.dto.TmdbGenreResponse;
import com.oko.external.tmdb.dto.TmdbMovieDetailResponse;
import com.oko.repository.GenreRepository;
import com.oko.repository.MovieCastRepository;
import com.oko.repository.MovieRepository;
import com.oko.repository.PersonRepository;
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
    private final PersonRepository personRepository;
    private final MovieCastRepository movieCastRepository;

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
        movie.setBackdropUrl("https://image.tmdb.org/t/p/w1280" + response.getBackdropPath());
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

    @Transactional
    public Movie syncMovie(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> {
                    Movie movie = mapToMovie(tmdbClient.getMovieById(tmdbId));
                    Movie savedMovie = movieRepository.save(movie);
                    syncCredits(savedMovie, tmdbId);
                    return savedMovie;
                });
    }

    private void syncCredits(Movie movie, Long tmdbId) {
        TmdbCreditsResponse credits = tmdbClient.getMovieCredits(tmdbId);

        if (credits.getCast() != null) {
            credits.getCast().stream()
                    .limit(10)
                    .forEach(tmdbCast -> {
                        Person person = findOrCreatePerson(tmdbCast);
                        MovieCast cast = new MovieCast();
                        cast.setMovie(movie);
                        cast.setPerson(person);
                        cast.setCharacterName(tmdbCast.getCharacter());
                        cast.setRoleType(MovieCast.RoleType.ACTOR);
                        cast.setOrderIndex(tmdbCast.getOrder());
                        movieCastRepository.save(cast);
                    });
        }

        if (credits.getCrew() != null) {
            credits.getCrew().stream()
                    .filter(c -> "Director".equals(c.getJob()))
                    .forEach(tmdbCrew -> {
                        Person person = findOrCreatePerson(tmdbCrew);
                        MovieCast cast = new MovieCast();
                        cast.setMovie(movie);
                        cast.setPerson(person);
                        cast.setRoleType(MovieCast.RoleType.DIRECTOR);
                        movieCastRepository.save(cast);
                    });
        }

        if (credits.getCrew() != null) {
            credits.getCrew().stream()
                    .filter(c -> "Writer".equals(c.getJob()) || "Screenplay".equals(c.getJob()))
                    .forEach(tmdbCrew -> {
                        Person person = findOrCreatePerson(tmdbCrew);
                        MovieCast cast = new MovieCast();
                        cast.setMovie(movie);
                        cast.setPerson(person);
                        cast.setRoleType(MovieCast.RoleType.WRITER);
                        movieCastRepository.save(cast);
                    });
        }
    }

    private Person findOrCreatePerson(TmdbCastResponse tmdbPerson) {
        return personRepository.findByTmdbId(tmdbPerson.getId())
                .orElseGet(() -> {
                    TmdbCastResponse fullDetails = tmdbClient.getPersonById(tmdbPerson.getId());
                    Person person = new Person();
                    person.setTmdbId(tmdbPerson.getId());
                    person.setName(tmdbPerson.getName());
                    if (tmdbPerson.getProfilePath() != null) {
                        person.setPhotoUrl("https://image.tmdb.org/t/p/w500" + tmdbPerson.getProfilePath());
                    }
                    person.setBiography(fullDetails.getBiography());
                    return personRepository.save(person);
                });
    }
}
