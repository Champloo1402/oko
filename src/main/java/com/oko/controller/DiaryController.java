package com.oko.controller;

import com.oko.dto.request.DiaryEntryRequest;
import com.oko.dto.response.DiaryEntryResponse;
import com.oko.service.DiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diary")
public class DiaryController {
    private final DiaryService diaryService;

    @PostMapping
    public DiaryEntryResponse addDiaryEntry(@Valid @RequestBody DiaryEntryRequest diaryEntryRequest) {
        return diaryService.addDiaryEntry(diaryEntryRequest);
    }

    @DeleteMapping("/{entryId}")
    public void deleteDiaryEntry(@PathVariable Long entryId) {
         diaryService.deleteDiaryEntry(entryId);
    }

    @GetMapping("/{username}")
    public List<DiaryEntryResponse> getDiary(@PathVariable String username) {
        return diaryService.getDiary(username);
    }
}
