package com.oko.repository;

import com.oko.entity.User;
import com.oko.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    List<UserFollow> findByFollower(User follower);
    List<UserFollow> findByFollowing(User following);
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);
}
