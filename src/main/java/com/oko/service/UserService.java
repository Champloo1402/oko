package com.oko.service;

import com.oko.dto.request.UpdateProfileRequest;
import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.UserProfileResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.Genre;
import com.oko.entity.User;
import com.oko.entity.WatchedMovie;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.oko.dto.response.UserStatsResponse;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;
    private final MovieService movieService;
    private final WatchedMovieRepository watchedMovieRepository;
    private final ReviewRepository reviewRepository;
    private final DiaryEntryRepository diaryEntryRepository;


    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found "));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setBio(user.getBio());

        List<MovieResponse> favFilms = Stream.of(
                        user.getFavoriteFilm1(), user.getFavoriteFilm2(),
                        user.getFavoriteFilm3(), user.getFavoriteFilm4(),
                        user.getFavoriteFilm5())
                .filter(Objects::nonNull)
                .map(movieService::mapToMovieResponse)
                .toList();
        response.setFavFilms(favFilms);

        response.setFollowerCount(userFollowRepository.findByFollowing(user).size());
        response.setFollowingCount(userFollowRepository.findByFollower(user).size());

        boolean isFollowed = currentUser != null &&
                userFollowRepository.existsByFollowerAndFollowing(currentUser, user);
        response.setFollowedByCurrentUser(isFollowed);

        return response;
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getBio() != null) user.setBio(request.getBio());

        if (request.getFavoriteFilm1Id() != null)
            user.setFavoriteFilm1(movieService.getMovieEntityById(request.getFavoriteFilm1Id()));
        if (request.getFavoriteFilm2Id() != null)
            user.setFavoriteFilm2(movieService.getMovieEntityById(request.getFavoriteFilm2Id()));
        if (request.getFavoriteFilm3Id() != null)
            user.setFavoriteFilm3(movieService.getMovieEntityById(request.getFavoriteFilm3Id()));
        if (request.getFavoriteFilm4Id() != null)
            user.setFavoriteFilm4(movieService.getMovieEntityById(request.getFavoriteFilm4Id()));
        if (request.getFavoriteFilm5Id() != null)
            user.setFavoriteFilm5(movieService.getMovieEntityById(request.getFavoriteFilm5Id()));

        userRepository.save(user);
        return getUserProfile(user.getUsername());
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse mapToUserSummaryResponse(User user){
        UserSummaryResponse response = new UserSummaryResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole().name());

        return response;
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats(String username) {
        User user = getUserByUsername(username);

        int totalFilmsWatched = watchedMovieRepository.countByUser(user);

        List<WatchedMovie> watchedMovies = watchedMovieRepository.findByUser(user);
        int totalMinutes = watchedMovies.stream()
                .map(w -> w.getMovie().getRuntimeMinutes())
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
        int totalHoursWatched = totalMinutes / 60;

        String mostWatchedGenre = watchedMovies.stream()
                .flatMap(w -> w.getMovie().getGenres().stream())
                .collect(Collectors.groupingBy(Genre::getName, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        int totalReviews = reviewRepository.countByUser(user);

        int totalDiaryEntries = diaryEntryRepository.countByUser(user);

        UserStatsResponse response = new UserStatsResponse();
        response.setUsername(user.getUsername());
        response.setTotalFilmsWatched(totalFilmsWatched);
        response.setTotalHoursWatched(totalHoursWatched);
        response.setMostWatchedGenre(mostWatchedGenre);
        response.setTotalReviews(totalReviews);
        response.setTotalDiaryEntries(totalDiaryEntries);
        return response;
    }

}
