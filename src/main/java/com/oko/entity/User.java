package com.oko.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "display_name")
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        USER, ADMIN
    }

    @ManyToOne
    @JoinColumn(name = "favorite_film_1")
    private Movie favoriteFilm1;

    @ManyToOne
    @JoinColumn(name = "favorite_film_2")
    private Movie favoriteFilm2;

    @ManyToOne
    @JoinColumn(name = "favorite_film_3")
    private Movie favoriteFilm3;

    @ManyToOne
    @JoinColumn(name = "favorite_film_4")
    private Movie favoriteFilm4;

    @ManyToOne
    @JoinColumn(name = "favorite_film_5")
    private Movie favoriteFilm5;
}
