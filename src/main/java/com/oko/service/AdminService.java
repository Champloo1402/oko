package com.oko.service;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.User;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.MovieRepository;
import com.oko.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserService userService;
    private final MovieService movieService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userService::mapToUserSummaryResponse)
                .toList();
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.delete(userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
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
