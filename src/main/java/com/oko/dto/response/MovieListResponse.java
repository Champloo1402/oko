package com.oko.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MovieListResponse {
    private Long id;
    private String username;
    private String name;
    private String description;
    private boolean publicList;
    private List<MovieResponse> movies;
    private int movieCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}