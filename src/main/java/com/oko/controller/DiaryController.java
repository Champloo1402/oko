package com.oko.controller;

import com.oko.dto.request.DiaryEntryRequest;
import com.oko.dto.response.DiaryEntryResponse;
import com.oko.dto.response.PageResponse;
import com.oko.service.DiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary")
public class DiaryController {
    private final DiaryService diaryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiaryEntryResponse addDiaryEntry(@Valid @RequestBody DiaryEntryRequest diaryEntryRequest) {
        return diaryService.addDiaryEntry(diaryEntryRequest);
    }

    @DeleteMapping("/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDiaryEntry(@PathVariable Long entryId) {
         diaryService.deleteDiaryEntry(entryId);
    }

    @GetMapping("/{username}")
    public PageResponse<DiaryEntryResponse> getDiary(
            @PathVariable String username,
            @PageableDefault(size = 20) Pageable pageable) {
        return diaryService.getDiary(username, pageable);
    }
}
