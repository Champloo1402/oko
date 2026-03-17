package com.oko.service;

import com.oko.dto.request.DiaryEntryRequest;
import com.oko.dto.response.DiaryEntryResponse;
import com.oko.dto.response.PageResponse;
import com.oko.entity.DiaryEntry;
import com.oko.entity.Movie;
import com.oko.entity.User;
import com.oko.exception.ResourceNotFoundException;
import com.oko.exception.UnauthorizedException;
import com.oko.repository.DiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryEntryRepository diaryEntryRepository;
    private final MovieService movieService;
    private final UserService userService;

    @Transactional
    public DiaryEntryResponse addDiaryEntry(DiaryEntryRequest request) {
        User user = userService.getCurrentUser();
        Movie movie = movieService.getMovieEntityById(request.getMovieId());

        DiaryEntry entry = new DiaryEntry();
        entry.setUser(user);
        entry.setMovie(movie);
        entry.setWatchedOn(request.getWatchedOn());
        entry.setRating(request.getRating());
        entry.setRewatch(request.isRewatch());
        entry.setNote(request.getNote());
        return mapDiaryEntryToResponse(diaryEntryRepository.save(entry));
    }

    @Transactional
    public void deleteDiaryEntry(Long entryId) {
        User user = userService.getCurrentUser();
        DiaryEntry entry = diaryEntryRepository.findById(entryId).orElseThrow(() -> new ResourceNotFoundException("Entry not found"));

        if(!user.equals(entry.getUser())) {
            throw new UnauthorizedException("You are not authorized to perform this operation");
        }

        diaryEntryRepository.deleteById(entryId);
    }

    @Transactional(readOnly = true)
    public PageResponse<DiaryEntryResponse> getDiary(String username, Pageable pageable) {
        User user = userService.getUserByUsername(username);
        return PageResponse.of(diaryEntryRepository.findByUserOrderByWatchedOnDesc(user, pageable)
                .map(this::mapDiaryEntryToResponse));
    }

    private DiaryEntryResponse mapDiaryEntryToResponse(DiaryEntry entry) {
        DiaryEntryResponse response = new DiaryEntryResponse();
        response.setId(entry.getId());
        response.setMovie(movieService.mapToMovieResponse(entry.getMovie()));
        response.setWatchedOn(entry.getWatchedOn());
        response.setRating(entry.getRating());
        response.setRewatch(entry.isRewatch());
        response.setNote(entry.getNote());
        response.setCreatedAt(entry.getCreatedAt());
        return response;
    }
}
