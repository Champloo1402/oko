package com.oko.dto.response;

import com.oko.entity.Movie;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WatchlistResponse {
    Long id;
    MovieResponse movie;
    LocalDateTime addedAt;

}
