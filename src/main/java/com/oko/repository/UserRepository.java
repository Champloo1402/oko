package com.oko.repository;

import com.oko.entity.Movie;
import com.oko.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.favoriteFilm1 = :movie OR u.favoriteFilm2 = :movie OR u.favoriteFilm3 = :movie OR u.favoriteFilm4 = :movie OR u.favoriteFilm5 = :movie")
    List<User> findByAnyFavoriteFilm(@Param("movie") Movie movie);
}
