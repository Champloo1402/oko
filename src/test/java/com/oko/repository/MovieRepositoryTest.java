package com.oko.repository;

import com.oko.entity.Movie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("dev")
@TestPropertySource(properties = {
        "JWT_SECRET=test-secret-key-for-testing-purposes-only-minimum-256-bits",
        "GOOGLE_CLIENT_ID=test-client-id",
        "GOOGLE_CLIENT_SECRET=test-client-secret",
        "TMDB_API_KEY=test-tmdb-key"
})
public class MovieRepositoryTest {

    @Autowired
    private MovieRepository movieRepository;

    private Movie createMovie(String title, Long tmdbId) {
        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setTmdbId(tmdbId);
        return movieRepository.save(movie);
    }

    @Test
    void findByTmdbId_returnsMovie_whenExists() {
        createMovie("Inception", 12345L);

        Optional<Movie> result = movieRepository.findByTmdbId(12345L);

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Inception");
    }

    @Test
    void findByTmdbId_returnsEmpty_whenNotExists() {
        Optional<Movie> result = movieRepository.findByTmdbId(99999L);

        assertThat(result).isEmpty();
    }

    @Test
    void save_persistsMovie() {
        Movie movie = createMovie("The Matrix", 67890L);

        assertThat(movie.getId()).isNotNull();
        assertThat(movie.getTitle()).isEqualTo("The Matrix");
    }

    @Test
    void findAll_returnsAllMovies() {
        createMovie("Movie One", 1L);
        createMovie("Movie Two", 2L);
        createMovie("Movie Three", 3L);

        List<Movie> movies = movieRepository.findAll();

        assertThat(movies).hasSizeGreaterThanOrEqualTo(3);
    }

    @Test
    void delete_removesMovie() {
        Movie movie = createMovie("To Delete", 99L);
        Long id = movie.getId();

        movieRepository.deleteById(id);

        assertThat(movieRepository.findById(id)).isEmpty();
    }
}