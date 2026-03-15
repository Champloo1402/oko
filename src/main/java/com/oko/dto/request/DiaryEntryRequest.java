package com.oko.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DiaryEntryRequest {

    @NotNull
    private Long movieId;

    @NotNull
    private LocalDate watchedOn;

    @DecimalMin("0.5")
    @DecimalMax("5.0")
    private Double rating;

    private boolean rewatch;

    @Size(max = 10000)
    private String note;
}
