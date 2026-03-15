package com.oko.service;

import com.oko.dto.response.UserSummaryResponse;
import com.oko.entity.User;
import com.oko.entity.UserFollow;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.repository.UserFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SocialService {
    private final UserFollowRepository userFollowRepository;
    private final UserService userService;

    @Transactional
    public void followUser(String username){
        User currentUser = userService.getCurrentUser();
        User targetUser = userService.getUserByUsername(username);

        if(currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if(userFollowRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            throw new DuplicateResourceException("Already following");
        }

        UserFollow userFollow = new UserFollow();
        userFollow.setFollower(currentUser);
        userFollow.setFollowing(targetUser);
        userFollowRepository.save(userFollow);
    }

    @Transactional
    public void unfollowUser(String username){
        User currentUser = userService.getCurrentUser();
        User targetUser = userService.getUserByUsername(username);

        UserFollow userFollow = userFollowRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("You are not following this user"));
        userFollowRepository.delete(userFollow);

    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getFollowers(String username){
        User user = userService.getUserByUsername(username);

        return userFollowRepository.findByFollowing(user)
                .stream()
                .map(follow -> userService.mapToUserSummaryResponse(follow.getFollower()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getFollowing(String username){
        User user = userService.getUserByUsername(username);

        return userFollowRepository.findByFollower(user)
                .stream()
                .map(follower -> userService.mapToUserSummaryResponse(follower.getFollowing()))
                .toList();
    }
}
