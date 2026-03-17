package com.oko.service;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.User;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserService userService;
    private final MovieService movieService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final WatchlistRepository watchlistRepository;
    private final UserFollowRepository userFollowRepository;
    private final WatchedMovieRepository watchedMovieRepository;


    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userService::mapToUserSummaryResponse)
                .toList();
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        reviewRepository.deleteByUser(user);
        diaryEntryRepository.deleteByUser(user);
        watchlistRepository.deleteByUser(user);
        userFollowRepository.deleteByFollower(user);
        userFollowRepository.deleteByFollowing(user);
        watchedMovieRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    @Transactional
    public UserSummaryResponse promoteToAdmin(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(User.Role.ADMIN);

        return userService.mapToUserSummaryResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(movieService::mapToMovieResponse)
                .toList();
    }

    @Transactional
    public void deleteMovie(Long id){
        movieRepository.deleteById(id);
    }

}
