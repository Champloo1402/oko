package com.oko;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "JWT_SECRET=test-secret-key-for-testing-purposes-only-minimum-256-bits",
        "GOOGLE_CLIENT_ID=test-client-id",
        "GOOGLE_CLIENT_SECRET=test-client-secret",
        "TMDB_API_KEY=test-tmdb-key"
})
class OkoApplicationTests {

    @Test
    void contextLoads() {
    }

}
