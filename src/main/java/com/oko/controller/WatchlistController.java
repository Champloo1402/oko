package com.oko.controller;

import com.oko.dto.response.PageResponse;
import com.oko.dto.response.WatchlistResponse;
import com.oko.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @PostMapping("/{movieId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WatchlistResponse addToWatchlist(@PathVariable Long movieId){
        return watchlistService.addToWatchlist(movieId);
    }

    @DeleteMapping("/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFromWatchlist(@PathVariable Long movieId){
        watchlistService.removeFromWatchlist(movieId);
    }

    @GetMapping
    public PageResponse<WatchlistResponse> getWatchlist(
            @PageableDefault(size = 20) Pageable pageable) {
        return watchlistService.getWatchlist(pageable);
    }

    @GetMapping("/{username}")
    public PageResponse<WatchlistResponse> getWatchlistByUsername(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return watchlistService.getWatchlistByUsername(username, pageable);
    }
}
