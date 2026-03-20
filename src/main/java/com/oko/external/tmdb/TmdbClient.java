package com.oko.external.tmdb;

import com.oko.external.tmdb.dto.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

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
        return webClient.get()
                .uri("/search/movie?query={query}", query)
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block()
                .getResults();

    }

    public TmdbMovieDetailResponse getMovieById(Long tmdbId){
        return webClient.get()
                .uri("/movie/{id}", tmdbId)
                .retrieve()
                .bodyToMono(TmdbMovieDetailResponse.class)
                .block();
    }

    public TmdbCreditsResponse getMovieCredits(Long tmdbId) {
        return webClient.get()
                .uri("/movie/{id}/credits", tmdbId)
                .retrieve()
                .bodyToMono(TmdbCreditsResponse.class)
                .block();
    }

    public List<TmdbMovieResponse> getPopularMovies() {
        return webClient.get()
                .uri("/movie/popular")
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block()
                .getResults();
    }

    public TmdbCastResponse getPersonById(Long tmdbId) {
        return webClient.get()
                .uri("/person/{id}", tmdbId)
                .retrieve()
                .bodyToMono(TmdbCastResponse.class)
                .block();
    }

    public TmdbPersonMovieCreditsResponse getPersonMovieCredits(Long tmdbPersonId) {
        return webClient.get()
                .uri("/person/{id}/movie_credits", tmdbPersonId)
                .retrieve()
                .bodyToMono(TmdbPersonMovieCreditsResponse.class)
                .block();
    }
}
