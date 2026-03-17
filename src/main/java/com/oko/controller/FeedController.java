package com.oko.controller;

import com.oko.dto.response.FeedItemResponse;
import com.oko.service.FeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/feed")
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public List<FeedItemResponse> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return feedService.getFeed(page, size);
    }
}
