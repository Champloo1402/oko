package com.oko.controller;

import com.oko.dto.request.UpdateProfileRequest;
import com.oko.dto.response.UserProfileResponse;
import com.oko.entity.User;
import com.oko.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}
