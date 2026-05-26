package com.oko.service;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.PageResponse;
import com.oko.dto.response.WatchlistResponse;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.WatchlistEntry;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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

        return mapToWatchlistResponse(watchlistRepository.save(watchlistEntry), user);
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
    public PageResponse<WatchlistResponse> getWatchlist(Pageable pageable) {
        User user = userService.getCurrentUser();
        return PageResponse.of(watchlistRepository.findByUser(user, pageable)
                .map(entry -> mapToWatchlistResponse(entry, user)));
    }

    @Transactional(readOnly = true)
    public PageResponse<WatchlistResponse> getWatchlistByUsername(String username, Pageable pageable) {
        User user = userService.getUserByUsername(username);       // list owner
        User currentUser = userService.getCurrentUserOrNull();     // logged in viewer
        return PageResponse.of(watchlistRepository.findByUser(user, pageable)
                .map(entry -> mapToWatchlistResponse(entry, currentUser)));
    }

    private WatchlistResponse mapToWatchlistResponse(WatchlistEntry entry, User currentUser){
        WatchlistResponse watchlistResponse = new WatchlistResponse();
        watchlistResponse.setId(entry.getId());
        watchlistResponse.setMovie(movieService.mapToMovieResponse(entry.getMovie(), currentUser));
        watchlistResponse.setAddedAt(entry.getAddedAt());

        return watchlistResponse;
    }

}
