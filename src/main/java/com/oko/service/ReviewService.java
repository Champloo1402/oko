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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieService movieService;
    private final UserService userService;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(request.getMovieId());

        if(reviewRepository.findByUserAndMovie(user, movie).isPresent()){
            throw new DuplicateResourceException("You have already reviewed this movie");
        }

        Review review = new Review();
        review.setUser(user);
        review.setMovie(movie);
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setSpoiler(request.isSpoiler());
        reviewRepository.save(review);


        return mapToReviewResponse(review);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        User user = userService.getCurrentUser();
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if(!user.equals(review.getUser())){
            throw new UnauthorizedException("You are not authorized to perform this action");
        }
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setSpoiler(request.isSpoiler());
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);

        return mapToReviewResponse(review);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        User user = userService.getCurrentUser();
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if(!user.equals(review.getUser())){
            throw new UnauthorizedException("You are not authorized to perform this action");
        }
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getMovieReviews(Long movieId) {
        Movie movie = movieService.getMovieEntityById(movieId);
        List<Review> reviews = reviewRepository.findByMovie(movie);

        return reviews.stream().map(this::mapToReviewResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(String username) {
        User user = userService.getUserByUsername(username);
        List<Review> reviews = reviewRepository.findByUser(user);

        return reviews.stream().map(this::mapToReviewResponse).toList();
    }

    private ReviewResponse mapToReviewResponse(Review review){
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUsername(review.getUser().getUsername());
        response.setAvatarUrl(review.getUser().getAvatarUrl());
        response.setRating(review.getRating());
        response.setContent(review.getContent());
        response.setSpoiler(review.isSpoiler());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
