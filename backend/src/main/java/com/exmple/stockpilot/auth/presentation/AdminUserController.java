package com.exmple.stockpilot.auth.presentation;

import com.exmple.stockpilot.auth.application.service.AuthService;
import com.exmple.stockpilot.auth.domain.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> list = authService.getAllUsers().stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest request) {
        User created = authService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleStatus(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String currentEmail = authentication.getName();
        User updated = authService.toggleUserStatus(id, currentEmail);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateUserRoleRequest request,
            Authentication authentication
    ) {
        String currentEmail = authentication.getName();
        User updated = authService.updateUserRole(id, request.role(), currentEmail);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable UUID id,
            @RequestBody @Valid ResetPasswordRequest request
    ) {
        authService.resetUserPassword(id, request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès."));
    }
}
