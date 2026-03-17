package com.oko.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "movie_likes", uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "movie_id"}))
public class MovieLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Column(name = "liked_at", nullable = false, updatable = false)
    private LocalDateTime likedAt = LocalDateTime.now();
}