package com.oko.dto.response;

import lombok.Data;

@Data
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String role;
}
