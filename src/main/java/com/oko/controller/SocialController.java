package com.oko.controller;

import com.oko.dto.response.UserSummaryResponse;
import com.oko.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/social")
public class SocialController {
    private final SocialService socialService;

    @PostMapping("/follow/{username}")
    public void followUser(@PathVariable String username){
        socialService.followUser(username);
    }

    @DeleteMapping("/unfollow/{username}")
    public void unfollowUser(@PathVariable String username){
        socialService.unfollowUser(username);
    }

    @GetMapping("/followers/{username}")
    public List<UserSummaryResponse> getFollowers(@PathVariable String username){
        return socialService.getFollowers(username);
    }

    @GetMapping("/following/{username}")
    public List<UserSummaryResponse> getFollowing(@PathVariable String username){
        return socialService.getFollowing(username);
    }
}
