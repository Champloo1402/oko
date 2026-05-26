CREATE TABLE users
(
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(255) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    bio             TEXT,
    avatar_url      VARCHAR(255),
    role            VARCHAR(50)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP    NOT NULL,
    favorite_film_1 BIGINT,
    favorite_film_2 BIGINT,
    favorite_film_3 BIGINT,
    favorite_film_4 BIGINT,
    favorite_film_5 BIGINT
);

CREATE TABLE movies
(
    id               BIGSERIAL PRIMARY KEY,
    tmdb_id          BIGINT UNIQUE,
    title            VARCHAR(255) NOT NULL,
    original_title   VARCHAR(255),
    overview         TEXT,
    release_year     INTEGER,
    runtime_minutes  INTEGER,
    poster_url       VARCHAR(255),
    backdrop_url     VARCHAR(255),
    language         VARCHAR(10),
    tmdb_rating      DOUBLE PRECISION
);

CREATE TABLE genres
(
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE people
(
    id         BIGSERIAL PRIMARY KEY,
    tmdb_id    BIGINT UNIQUE,
    name       VARCHAR(255) NOT NULL,
    photo_url  VARCHAR(255),
    biography  TEXT
);

CREATE TABLE movie_genres
(
    movie_id BIGINT NOT NULL REFERENCES movies (id),
    genre_id BIGINT NOT NULL REFERENCES genres (id),
    PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE movie_cast
(
    id             BIGSERIAL PRIMARY KEY,
    movie_id       BIGINT       NOT NULL REFERENCES movies (id),
    person_id      BIGINT       NOT NULL REFERENCES people (id),
    character_name VARCHAR(255),
    role_type      VARCHAR(50)  NOT NULL,
    order_index    INTEGER
);

CREATE TABLE reviews
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users (id),
    movie_id   BIGINT    NOT NULL REFERENCES movies (id),
    rating     DOUBLE PRECISION,
    content    TEXT,
    is_spoiler BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE diary_entries
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT  NOT NULL REFERENCES users (id),
    movie_id   BIGINT  NOT NULL REFERENCES movies (id),
    watched_on DATE    NOT NULL,
    rating     DOUBLE PRECISION,
    rewatch    BOOLEAN NOT NULL DEFAULT FALSE,
    note       TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE watchlist
(
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT    NOT NULL REFERENCES users (id),
    movie_id BIGINT    NOT NULL REFERENCES movies (id),
    added_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE watched_movies
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users (id),
    movie_id   BIGINT    NOT NULL REFERENCES movies (id),
    watched_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE movie_likes
(
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT    NOT NULL REFERENCES users (id),
    movie_id BIGINT    NOT NULL REFERENCES movies (id),
    liked_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, movie_id)
);

CREATE TABLE movie_lists
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users (id),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    public_list BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL,
    updated_at  TIMESTAMP
);

CREATE TABLE movie_list_entries
(
    list_id  BIGINT NOT NULL REFERENCES movie_lists (id),
    movie_id BIGINT NOT NULL REFERENCES movies (id),
    PRIMARY KEY (list_id, movie_id)
);

CREATE TABLE user_follows
(
    id           BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT    NOT NULL REFERENCES users (id),
    following_id BIGINT    NOT NULL REFERENCES users (id),
    created_at   TIMESTAMP NOT NULL,
    UNIQUE (follower_id, following_id)
);

ALTER TABLE users
    ADD CONSTRAINT fk_favorite_film_1 FOREIGN KEY (favorite_film_1) REFERENCES movies (id),
    ADD CONSTRAINT fk_favorite_film_2 FOREIGN KEY (favorite_film_2) REFERENCES movies (id),
    ADD CONSTRAINT fk_favorite_film_3 FOREIGN KEY (favorite_film_3) REFERENCES movies (id),
    ADD CONSTRAINT fk_favorite_film_4 FOREIGN KEY (favorite_film_4) REFERENCES movies (id),
    ADD CONSTRAINT fk_favorite_film_5 FOREIGN KEY (favorite_film_5) REFERENCES movies (id);