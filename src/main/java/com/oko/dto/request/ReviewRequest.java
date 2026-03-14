package com.oko.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull
    private Long movieId;

    @DecimalMin("0.5")
    @DecimalMax("5.0")
    private Double rating;

    @Size(max = 10000)
    private String content;

    private boolean isSpoiler;
}
