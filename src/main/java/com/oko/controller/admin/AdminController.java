package com.oko.controller.admin;

import com.oko.dto.response.MovieResponse;
import com.oko.dto.response.UserSummaryResponse;
import com.oko.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
    public List<UserSummaryResponse> getAllUsers(){
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId){
        adminService.deleteUser(userId);
    }

    @PutMapping("/users/{userId}/promote")
    public UserSummaryResponse promoteUser(@PathVariable Long userId){
        return adminService.promoteToAdmin(userId);
    }

    @GetMapping("/movies")
    public List<MovieResponse> getAllMovies(){
        return adminService.getAllMovies();
    }

    @DeleteMapping("/movies/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMovie(@PathVariable Long movieId){
        adminService.deleteMovie(movieId);
    }

}
