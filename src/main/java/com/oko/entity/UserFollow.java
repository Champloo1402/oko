package com.oko.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_follows", uniqueConstraints = @UniqueConstraint(
        columnNames = {"follower_id", "following_id"}))
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name  ="follower_id", nullable = false)
    private User follower;

    @ManyToOne
    @JoinColumn(name  ="following_id", nullable = false)
    private User following;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
