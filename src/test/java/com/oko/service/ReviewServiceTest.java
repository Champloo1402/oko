package com.oko.service;

import com.oko.dto.request.ReviewRequest;
import com.oko.dto.response.ReviewResponse;
import com.oko.entity.Movie;
import com.oko.entity.Review;
import com.oko.entity.User;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.exception.UnauthorizedException;
import com.oko.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private MovieService movieService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReviewService reviewService;

    private User user;
    private Movie movie;
    private Review review;
    private ReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        movie = new Movie();
        movie.setId(1L);
        movie.setTitle("Fight Club");

        review = new Review();
        review.setId(1L);
        review.setUser(user);
        review.setMovie(movie);
        review.setRating(4.5);
        review.setContent("Great movie!");
        review.setSpoiler(false);

        reviewRequest = new ReviewRequest();
        reviewRequest.setMovieId(1L);
        reviewRequest.setRating(4.5);
        reviewRequest.setContent("Great movie!");
        reviewRequest.setSpoiler(false);
    }

    @Test
    void createReview_success() {
        when(userService.getCurrentUser()).thenReturn(user);
        when(movieService.getMovieEntityById(1L)).thenReturn(movie);
        when(reviewRepository.findByUserAndMovie(user, movie)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        ReviewResponse response = reviewService.createReview(reviewRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals(4.5, response.getRating());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void createReview_throwsDuplicateException_whenReviewAlreadyExists() {
        when(userService.getCurrentUser()).thenReturn(user);
        when(movieService.getMovieEntityById(1L)).thenReturn(movie);
        when(reviewRepository.findByUserAndMovie(user, movie)).thenReturn(Optional.of(review));

        assertThrows(DuplicateResourceException.class, () ->
                reviewService.createReview(reviewRequest));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void deleteReview_success() {
        when(userService.getCurrentUser()).thenReturn(user);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(1L);

        verify(reviewRepository, times(1)).delete(review);
    }

    @Test
    void deleteReview_throwsUnauthorizedException_whenUserIsNotOwner() {
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");

        when(userService.getCurrentUser()).thenReturn(otherUser);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThrows(UnauthorizedException.class, () ->
                reviewService.deleteReview(1L));

        verify(reviewRepository, never()).delete(any(Review.class));
    }

    @Test
    void deleteReview_throwsResourceNotFoundException_whenReviewDoesNotExist() {
        when(userService.getCurrentUser()).thenReturn(user);
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                reviewService.deleteReview(99L));
    }

    @Test
    void updateReview_throwsUnauthorizedException_whenUserIsNotOwner() {
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("otheruser");

        when(userService.getCurrentUser()).thenReturn(otherUser);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThrows(UnauthorizedException.class, () ->
                reviewService.updateReview(1L, reviewRequest));
    }
}