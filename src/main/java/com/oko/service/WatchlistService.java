package com.oko.service;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.WatchlistResponse;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.WatchlistEntry;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieService movieService;
    private final UserService userService;

    @Transactional
    public WatchlistResponse addToWatchlist(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);

        if(watchlistRepository.existsByUserAndMovie(user, movie)){
            throw new DuplicateResourceException("Movie already in Watchlist");
        }

        WatchlistEntry watchlistEntry = new WatchlistEntry();
        watchlistEntry.setUser(user);
        watchlistEntry.setMovie(movie);

        return mapToWatchlistResponse(watchlistRepository.save(watchlistEntry));
    }

    @Transactional
    public void removeFromWatchlist(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);
        WatchlistEntry entry = watchlistRepository.findByUserAndMovie(user, movie)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist entry not found"));
        watchlistRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public List<WatchlistResponse> getWatchlist(){
        User user = userService.getCurrentUser();
        List<WatchlistEntry> list = watchlistRepository.findByUser(user);
        return list.stream().map(this::mapToWatchlistResponse).toList();
    }

    private WatchlistResponse mapToWatchlistResponse(WatchlistEntry entry){
        WatchlistResponse watchlistResponse = new WatchlistResponse();
        watchlistResponse.setId(entry.getId());
        watchlistResponse.setMovie(movieService.mapToMovieResponse(entry.getMovie()));
        watchlistResponse.setAddedAt(entry.getAddedAt());

        return watchlistResponse;
    }

}
