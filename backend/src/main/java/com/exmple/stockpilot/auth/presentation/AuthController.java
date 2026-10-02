package com.exmple.stockpilot.auth.presentation;

import com.exmple.stockpilot.auth.application.port.in.AuthResult;
import com.exmple.stockpilot.auth.application.port.in.LoginCommand;
import com.exmple.stockpilot.auth.application.port.in.RefreshTokenCommand;
import com.exmple.stockpilot.auth.application.service.AuthService;
import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.domain.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        AuthResult r = authService.login(new LoginCommand(request.email(), request.password()));
        return ResponseEntity.ok(toResponse(r));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request.email(), request.password(), request.firstName(), request.lastName(), Role.USER);
        AuthResult r = authService.login(new LoginCommand(request.email(), request.password()));
        return ResponseEntity.ok(toResponse(r));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        AuthResult r = authService.refresh(new RefreshTokenCommand(request.refreshToken()));
        return ResponseEntity.ok(toResponse(r));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        User u = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(UserResponse.from(u));
    }

    private AuthResponse toResponse(AuthResult r) {
        return new AuthResponse(r.accessToken(), r.refreshToken(), r.tokenType(), r.expiresInSeconds(), UserResponse.from(r.user()));
    }
}
