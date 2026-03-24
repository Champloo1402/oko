package com.oko.external.tmdb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class TmdbMovieDetailResponse {
    private Long id;
    private String title;

    @JsonProperty("original_title")
    private String originalTitle;

    private String overview;
    private String tagline;
    private Integer runtime;

    @JsonProperty("release_date")
    private String releaseDate;

    @JsonProperty("poster_path")
    private String posterPath;

    @JsonProperty("backdrop_path")
    private String backdropPath;

    @JsonProperty("original_language")
    private String originalLanguage;

    private List<TmdbGenreResponse> genres;

    @JsonProperty("vote_average")
    private Double voteAverage;
}
