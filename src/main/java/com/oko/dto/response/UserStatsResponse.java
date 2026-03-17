package com.oko.dto.response;

import lombok.Data;

@Data
public class UserStatsResponse {
    private String username;
    private int totalFilmsWatched;
    private int totalHoursWatched;
    private String mostWatchedGenre;
    private int totalReviews;
    private int totalDiaryEntries;
}