package com.oko.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WatchedMovieResponse {
    private Long id;
    private MovieResponse movie;
    private LocalDateTime watchedAt;
}