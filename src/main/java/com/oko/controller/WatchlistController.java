package com.oko.controller;

import com.oko.dto.response.WatchlistResponse;
import com.oko.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @PostMapping("/{movieId}")
    public WatchlistResponse addToWatchlist(@PathVariable Long movieId){
        return watchlistService.addToWatchlist(movieId);
    }

    @DeleteMapping("/{movieId}")
    public void deleteFromWatchlist(@PathVariable Long movieId){
        watchlistService.removeFromWatchlist(movieId);
    }

    @GetMapping
    public List<WatchlistResponse> getWatchlist(){
        return watchlistService.getWatchlist();
    }

}
