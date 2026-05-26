package com.oko.service;

import com.oko.dto.response.FeedItemResponse;
import com.oko.dto.response.MovieResponse;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.entity.UserFollow;
import com.oko.repository.DiaryEntryRepository;
import com.oko.repository.ReviewRepository;
import com.oko.repository.UserFollowRepository;
import com.oko.repository.WatchedMovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final UserService userService;
    private final UserFollowRepository userFollowRepository;
    private final ReviewRepository reviewRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final WatchedMovieRepository watchedMovieRepository;
    private final MovieService movieService;

    @Transactional(readOnly = true)
    public List<FeedItemResponse> getFeed(int page, int size) {
        User currentUser = userService.getCurrentUser();
        Pageable limit = PageRequest.of(0, (page + 1) * size);

        List<User> following = userFollowRepository.findByFollower(currentUser)
                .stream()
                .map(UserFollow::getFollowing)
                .toList();

        if (following.isEmpty()) return List.of();

        var reviews = reviewRepository.findByUserInOrderByCreatedAtDesc(following, limit);
        var diaryEntries = diaryEntryRepository.findByUserInOrderByWatchedOnDesc(following, limit);
        var watchedMovies = watchedMovieRepository.findByUserInOrderByWatchedAtDesc(following, limit);

        List<Movie> allMovies = new ArrayList<>();
        reviews.forEach(r -> allMovies.add(r.getMovie()));
        diaryEntries.forEach(e -> allMovies.add(e.getMovie()));
        watchedMovies.forEach(w -> allMovies.add(w.getMovie()));

        Map<Long, MovieResponse> movieResponseMap = movieService.mapToMovieResponses(allMovies, currentUser)
                .stream()
                .collect(Collectors.toMap(MovieResponse::getId, r -> r));

        List<FeedItemResponse> feed = new ArrayList<>();

        reviews.forEach(review -> {
            FeedItemResponse item = new FeedItemResponse();
            item.setType("REVIEW");
            item.setUsername(review.getUser().getUsername());
            item.setAvatarUrl(review.getUser().getAvatarUrl());
            item.setMovie(movieResponseMap.get(review.getMovie().getId())); // ← lookup, no query
            item.setRating(review.getRating());
            item.setContent(review.getContent());
            item.setTimestamp(review.getCreatedAt());
            feed.add(item);
        });

        diaryEntries.forEach(entry -> {
            FeedItemResponse item = new FeedItemResponse();
            item.setType("DIARY");
            item.setUsername(entry.getUser().getUsername());
            item.setAvatarUrl(entry.getUser().getAvatarUrl());
            item.setMovie(movieResponseMap.get(entry.getMovie().getId())); // ← lookup, no query
            item.setRating(entry.getRating());
            item.setContent(entry.getNote());
            item.setTimestamp(entry.getCreatedAt());
            feed.add(item);
        });

        watchedMovies.forEach(watched -> {
            FeedItemResponse item = new FeedItemResponse();
            item.setType("WATCHED");
            item.setUsername(watched.getUser().getUsername());
            item.setAvatarUrl(watched.getUser().getAvatarUrl());
            item.setMovie(movieResponseMap.get(watched.getMovie().getId())); // ← lookup, no query
            item.setTimestamp(watched.getWatchedAt());
            feed.add(item);
        });

        return feed.stream()
                .sorted(Comparator.comparing(FeedItemResponse::getTimestamp).reversed())
                .skip((long) page * size)
                .limit(size)
                .toList();
    }
}