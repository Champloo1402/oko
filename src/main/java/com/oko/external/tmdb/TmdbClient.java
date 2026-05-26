package com.oko.external.tmdb;

import com.oko.exception.ResourceNotFoundException;
import com.oko.external.tmdb.dto.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.Duration;

import java.util.List;
import java.util.Objects;

@Component
public class TmdbClient {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${tmdb.api.base-url}")
    private String tmdbApiBaseUrl;

    private WebClient webClient;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(tmdbApiBaseUrl)
                .defaultHeader("Authorization", "Bearer " + tmdbApiKey)
                .build();
    }

    public List<TmdbMovieResponse> searchMovies(String query) {
        return Objects.requireNonNull(webClient.get()
                        .uri("/search/movie?query={query}", query)
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, response ->
                                Mono.error(new ResourceNotFoundException("Movie not found")))
                        .onStatus(HttpStatusCode::is5xxServerError, response ->
                                Mono.error(new RuntimeException("TMDB server error")))
                        .bodyToMono(TmdbSearchResponse.class)
                        .timeout(Duration.ofSeconds(5))
                        .block())
                .getResults();

    }

    public TmdbMovieDetailResponse getMovieById(Long tmdbId) {
        return webClient.get()
                .uri("/movie/{id}", tmdbId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                        Mono.error(new ResourceNotFoundException("Movie not found on TMDB")))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("TMDB server error")))
                .bodyToMono(TmdbMovieDetailResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
    }

    public TmdbCreditsResponse getMovieCredits(Long tmdbId) {
        return webClient.get()
                .uri("/movie/{id}/credits", tmdbId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                        Mono.error(new ResourceNotFoundException("Credits not found on TMDB")))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("TMDB server error")))
                .bodyToMono(TmdbCreditsResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
    }

    public List<TmdbMovieResponse> getPopularMovies() {
        return Objects.requireNonNull(webClient.get()
                        .uri("/movie/popular")
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, response ->
                                Mono.error(new ResourceNotFoundException("Movies not found on TMDB")))
                        .onStatus(HttpStatusCode::is5xxServerError, response ->
                                Mono.error(new RuntimeException("TMDB server error")))
                        .bodyToMono(TmdbSearchResponse.class)
                        .timeout(Duration.ofSeconds(5))
                        .block())
                .getResults();
    }

    public TmdbCastResponse getPersonById(Long tmdbId) {
        return webClient.get()
                .uri("/person/{id}", tmdbId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                        Mono.error(new ResourceNotFoundException("Person not found on TMDB")))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("TMDB server error")))
                .bodyToMono(TmdbCastResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
    }

    public TmdbPersonMovieCreditsResponse getPersonMovieCredits(Long tmdbPersonId) {
        return webClient.get()
                .uri("/person/{id}/movie_credits", tmdbPersonId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                        Mono.error(new ResourceNotFoundException("Person Movie credits not found on TMDB")))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("TMDB server error")))
                .bodyToMono(TmdbPersonMovieCreditsResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
    }
}
