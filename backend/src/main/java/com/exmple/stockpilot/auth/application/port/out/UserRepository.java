package com.exmple.stockpilot.auth.application.port.out;

import com.exmple.stockpilot.auth.domain.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findByEmail(String email);
    Optional<User> findById(UUID id);
    List<User> findAll();
    User save(User user);
    boolean existsByEmail(String email);
}
