package com.oko.service;

import com.oko.entity.Movie;
import com.oko.entity.MovieLike;
import com.oko.entity.User;
import com.oko.exception.DuplicateResourceException;
import com.oko.repository.MovieLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieLikeService {

    private final MovieLikeRepository movieLikeRepository;
    private final UserService userService;
    private final MovieService movieService;

    @Transactional
    public void likeMovie(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);

        if (movieLikeRepository.existsByUserAndMovie(user, movie)) {
            throw new DuplicateResourceException("Movie already liked");
        }

        MovieLike like = new MovieLike();
        like.setUser(user);
        like.setMovie(movie);
        movieLikeRepository.save(like);
    }

    @Transactional
    public void unlikeMovie(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);
        movieLikeRepository.deleteByUserAndMovie(user, movie);
    }

    @Transactional(readOnly = true)
    public boolean hasLiked(Long movieId) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(movieId);
        return movieLikeRepository.existsByUserAndMovie(user, movie);
    }
}