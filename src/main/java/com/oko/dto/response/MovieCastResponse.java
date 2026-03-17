package com.oko.dto.response;

import lombok.Data;

@Data
public class MovieCastResponse {
    private Long id;
    private PersonResponse person;
    private String characterName;
    private String roleType;
    private Integer orderIndex;
}