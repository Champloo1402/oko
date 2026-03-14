package com.oko.controller;

import com.oko.dto.request.ReviewRequest;
import com.oko.dto.response.ReviewResponse;
import com.oko.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponse createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        return reviewService.createReview(reviewRequest);
    }

    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewRequest reviewRequest) {
        return reviewService.updateReview(reviewId, reviewRequest);
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
    }

    @GetMapping("/movie/{movieId}")
    public List<ReviewResponse> getMovieReviews(@PathVariable Long movieId) {
        return reviewService.getMovieReviews(movieId);
    }

    @GetMapping("/user/{username}")
    public List<ReviewResponse> getUserReviews(@PathVariable String username) {
        return reviewService.getUserReviews(username);
    }
}
