package com.oko.controller;

import com.oko.dto.request.ReviewRequest;
import com.oko.dto.response.PageResponse;
import com.oko.dto.response.ReviewResponse;
import com.oko.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        return reviewService.createReview(reviewRequest);
    }

    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewRequest reviewRequest) {
        return reviewService.updateReview(reviewId, reviewRequest);
    }

    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
    }

    @GetMapping("/movie/{movieId}")
    public PageResponse<ReviewResponse> getMovieReviews(
            @PathVariable Long movieId,
            @PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getMovieReviews(movieId, pageable);
    }

    @GetMapping("/user/{username}")
    public PageResponse<ReviewResponse> getUserReviews(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getUserReviews(username, pageable);
    }
}
