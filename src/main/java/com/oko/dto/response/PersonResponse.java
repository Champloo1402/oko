package com.oko.dto.response;

import lombok.Data;

@Data
public class PersonResponse {
    private Long id;
    private String name;
    private String photoUrl;
    private String biography;
}