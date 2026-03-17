package com.oko.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class MovieResponse {
    private Long id;

    private Long tmdbId;

    private String title;

    private String originalTitle;

    private String overview;

    private Integer releaseYear;

    private Integer runtimeMinutes;

    private String posterUrl;

    private String backdropUrl;

    private String language;

    private List<GenreResponse> genres;

    private Double averageRating;
    private Integer likeCount;
    private Boolean likedByCurrentUser;

}
