package com.oko.external.tmdb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TmdbCastResponse {
    private Long id;
    private String name;

    @JsonProperty("profile_path")
    private String profilePath;

    private String biography;

    @JsonProperty("character")
    private String character;

    @JsonProperty("order")
    private Integer order;

    @JsonProperty("known_for_department")
    private String knownForDepartment;

    @JsonProperty("job")
    private String job;
}