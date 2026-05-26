package com.oko.service;

import com.oko.dto.request.CreateListRequest;
import com.oko.dto.response.MovieListResponse;
import com.oko.entity.Movie;
import com.oko.entity.MovieList;
import com.oko.entity.User;
import com.oko.exception.DuplicateResourceException;
import com.oko.exception.ResourceNotFoundException;
import com.oko.exception.UnauthorizedException;
import com.oko.repository.MovieListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieListService {

    private final MovieListRepository movieListRepository;
    private final UserService userService;
    private final MovieService movieService;

    @Transactional
    public MovieListResponse createList(CreateListRequest request) {
        User user = userService.getCurrentUser();

        MovieList list = new MovieList();
        list.setUser(user);
        list.setName(request.getName());
        list.setDescription(request.getDescription());
        list.setPublicList(request.isPublic());

        return mapToResponse(movieListRepository.save(list), user);
    }

    @Transactional
    public MovieListResponse addMovieToList(Long listId, Long movieId) {
        User user = userService.getCurrentUser();
        MovieList list = getListAndVerifyOwnership(listId, user);
        Movie movie = movieService.getMovieEntityById(movieId);

        if (list.getMovies().contains(movie)) {
            throw new DuplicateResourceException("Movie already in this list");
        }

        list.getMovies().add(movie);
        list.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(movieListRepository.save(list), user);
    }

    @Transactional
    public MovieListResponse removeMovieFromList(Long listId, Long movieId) {
        User user = userService.getCurrentUser();
        MovieList list = getListAndVerifyOwnership(listId, user);
        Movie movie = movieService.getMovieEntityById(movieId);

        list.getMovies().remove(movie);
        list.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(movieListRepository.save(list), user);
    }

    @Transactional
    public void deleteList(Long listId) {
        User user = userService.getCurrentUser();
        MovieList list = getListAndVerifyOwnership(listId, user);
        movieListRepository.delete(list);
    }

    @Transactional(readOnly = true)
    public List<MovieListResponse> getUserLists(String username) {
        User user = userService.getUserByUsername(username);
        User currentUser = userService.getCurrentUserOrNull();
        return movieListRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(list -> mapToResponse(list, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public MovieListResponse getListById(Long listId) {
        User currentUser = userService.getCurrentUserOrNull();
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found"));
        return mapToResponse(list, currentUser);
    }

    private MovieList getListAndVerifyOwnership(Long listId, User user) {
        MovieList list = movieListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found"));
        if (!list.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this list");
        }
        return list;
    }

    private MovieListResponse mapToResponse(MovieList list, User currentUser) {
        MovieListResponse response = new MovieListResponse();
        response.setId(list.getId());
        response.setUsername(list.getUser().getUsername());
        response.setName(list.getName());
        response.setDescription(list.getDescription());
        response.setPublicList(list.isPublicList());
        response.setMovies(movieService.mapToMovieResponses(list.getMovies(), currentUser));
        response.setMovieCount(list.getMovies().size());
        response.setCreatedAt(list.getCreatedAt());
        response.setUpdatedAt(list.getUpdatedAt());
        return response;
    }
}