package com.oko.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewResponse {

    private Long id;

    private String username;

    private String avatarUrl;

    private Double rating;

    private String content;

    private boolean isSpoiler;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
