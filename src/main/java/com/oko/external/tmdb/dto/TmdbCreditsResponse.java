package com.oko.external.tmdb.dto;

import lombok.Data;
import java.util.List;

@Data
public class TmdbCreditsResponse {
    private List<TmdbCastResponse> cast;
    private List<TmdbCastResponse> crew;
}