package com.oko.controller;

import com.oko.dto.request.UpdateProfileRequest;
import com.oko.dto.response.PageResponse;
import com.oko.dto.response.UserProfileResponse;
import com.oko.dto.response.UserStatsResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.User;
import com.oko.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public UserProfileResponse getUserProfile(@PathVariable String username){
        return userService.getUserProfile(username);
    }

    @PutMapping("/me")
    public UserProfileResponse updateCurrentUserProfile(@RequestBody UpdateProfileRequest request){
        return userService.updateProfile(request);
    }

    @GetMapping("/{username}/stats")
    public UserStatsResponse getUserStats(@PathVariable String username) {
        return userService.getUserStats(username);
    }

    @GetMapping("/search")
    public PageResponse<UserSummaryResponse> searchUsers(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        return userService.searchUsers(query, pageable);
    }
}
