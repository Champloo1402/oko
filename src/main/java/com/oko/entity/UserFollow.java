package com.oko.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
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

    @Override
    public boolean equals(Object obj) {
        if (obj == this) return true;
        if(!(obj instanceof UserFollow other)) return false;
        return id !=null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
