package com.oko.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private Long favoriteFilm1Id;
    private Long favoriteFilm2Id;
    private Long favoriteFilm3Id;
    private Long favoriteFilm4Id;
    private Long favoriteFilm5Id;
}
