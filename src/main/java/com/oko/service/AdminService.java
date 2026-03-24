package com.oko.service;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.Movie;
import com.oko.entity.MovieList;
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
    private final MovieLikeRepository movieLikeRepository;
    private final MovieListRepository movieListRepository;
    private final MovieCastRepository movieCastRepository;


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
        movieLikeRepository.deleteByUser(user);
        movieListRepository.deleteByUser(user);
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
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));


        List<MovieList> listsContainingMovie = movieListRepository.findByMoviesContaining(movie);
        listsContainingMovie.forEach(list -> list.getMovies().remove(movie));
        movieListRepository.saveAll(listsContainingMovie);
        userRepository.findAll().stream()
                .filter(u -> movie.equals(u.getFavoriteFilm1()) ||
                        movie.equals(u.getFavoriteFilm2()) ||
                        movie.equals(u.getFavoriteFilm3()) ||
                        movie.equals(u.getFavoriteFilm4()) ||
                        movie.equals(u.getFavoriteFilm5()))
                .forEach(u -> {
                    if (movie.equals(u.getFavoriteFilm1())) u.setFavoriteFilm1(null);
                    if (movie.equals(u.getFavoriteFilm2())) u.setFavoriteFilm2(null);
                    if (movie.equals(u.getFavoriteFilm3())) u.setFavoriteFilm3(null);
                    if (movie.equals(u.getFavoriteFilm4())) u.setFavoriteFilm4(null);
                    if (movie.equals(u.getFavoriteFilm5())) u.setFavoriteFilm5(null);
                    userRepository.save(u);
                });
        reviewRepository.deleteByMovie(movie);
        diaryEntryRepository.deleteByMovie(movie);
        watchlistRepository.deleteByMovie(movie);
        watchedMovieRepository.deleteByMovie(movie);
        movieLikeRepository.deleteByMovie(movie);
        movieCastRepository.deleteByMovie(movie);

        movieRepository.delete(movie);
    }

}
