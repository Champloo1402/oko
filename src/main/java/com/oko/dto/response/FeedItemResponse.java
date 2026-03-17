package com.oko.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedItemResponse {
    private String type; // "REVIEW", "DIARY", "WATCHED"
    private String username;
    private String avatarUrl;
    private MovieResponse movie;
    private Double rating;
    private String content;
    private LocalDateTime timestamp;
}