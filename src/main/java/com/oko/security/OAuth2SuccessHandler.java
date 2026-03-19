package com.oko.security;

import com.oko.entity.User;
import com.oko.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(generateUsername(email));
                    newUser.setDisplayName(name);
                    newUser.setPassword("GOOGLE_AUTH_" + email);
                    return newUser;
                });

        user.setAvatarUrl(picture);
        if (user.getDisplayName() == null) {
            user.setDisplayName(name);
        }

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);

        getRedirectStrategy().sendRedirect(request, response,
                "http://localhost:3000/oauth2/callback?token=" + token);
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String username = base;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + counter++;
        }
        return username;
    }
}