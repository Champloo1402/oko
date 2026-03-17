package com.oko.service;

import com.oko.dto.response.FeedItemResponse;
import com.oko.entity.User;
import com.oko.entity.UserFollow;
import com.oko.repository.DiaryEntryRepository;
import com.oko.repository.ReviewRepository;
import com.oko.repository.UserFollowRepository;
import com.oko.repository.WatchedMovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

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

        List<User> following = userFollowRepository.findByFollower(currentUser)
                .stream()
                .map(UserFollow::getFollowing)
                .toList();

        if (following.isEmpty()) {
            return List.of();
        }

        List<FeedItemResponse> feed = new ArrayList<>();

        reviewRepository.findByUserInOrderByCreatedAtDesc(following)
                .forEach(review -> {
                    FeedItemResponse item = new FeedItemResponse();
                    item.setType("REVIEW");
                    item.setUsername(review.getUser().getUsername());
                    item.setAvatarUrl(review.getUser().getAvatarUrl());
                    item.setMovie(movieService.mapToMovieResponse(review.getMovie()));
                    item.setRating(review.getRating());
                    item.setContent(review.getContent());
                    item.setTimestamp(review.getCreatedAt());
                    feed.add(item);
                });

        diaryEntryRepository.findByUserInOrderByWatchedOnDesc(following)
                .forEach(entry -> {
                    FeedItemResponse item = new FeedItemResponse();
                    item.setType("DIARY");
                    item.setUsername(entry.getUser().getUsername());
                    item.setAvatarUrl(entry.getUser().getAvatarUrl());
                    item.setMovie(movieService.mapToMovieResponse(entry.getMovie()));
                    item.setRating(entry.getRating());
                    item.setContent(entry.getNote());
                    item.setTimestamp(entry.getCreatedAt());
                    feed.add(item);
                });

        watchedMovieRepository.findByUserInOrderByWatchedAtDesc(following)
                .forEach(watched -> {
                    FeedItemResponse item = new FeedItemResponse();
                    item.setType("WATCHED");
                    item.setUsername(watched.getUser().getUsername());
                    item.setAvatarUrl(watched.getUser().getAvatarUrl());
                    item.setMovie(movieService.mapToMovieResponse(watched.getMovie()));
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