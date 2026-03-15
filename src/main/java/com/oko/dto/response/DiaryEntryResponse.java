package com.oko.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DiaryEntryResponse {

    private Long id;

    private MovieResponse movie;

    private LocalDate watchedOn;

    private Double rating;

    private boolean rewatch;

    private String note;

    private LocalDateTime createdAt;
}
