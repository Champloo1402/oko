package com.oko.external.tmdb.dto;

import lombok.Data;
import java.util.List;

@Data
public class TmdbPersonMovieCreditsResponse {
    private List<TmdbMovieResponse> cast;
    private List<TmdbMovieResponse> crew;
}