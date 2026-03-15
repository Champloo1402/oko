package com.oko.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class UserProfileResponse {
    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private List<MovieResponse> favFilms;
    private Integer followerCount;
    private Integer followingCount;
    private boolean isFollowedByCurrentUser;
}
