package com.exmple.stockpilot.auth.infrastructure.seed;

import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.infrastructure.persistence.SpringDataUserRepository;
import com.exmple.stockpilot.auth.infrastructure.persistence.UserJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final SpringDataUserRepository userRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() == 0) {
            userRepo.save(UserJpaEntity.builder()
                    .id(UUID.randomUUID())
                    .email("admin@stockpilot.com")
                    .passwordHash(encoder.encode("Admin@1234"))
                    .firstName("Admin")
                    .lastName("StockPilot")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build());
            userRepo.save(UserJpaEntity.builder()
                    .id(UUID.randomUUID())
                    .email("manager@stockpilot.com")
                    .passwordHash(encoder.encode("Manager@1234"))
                    .firstName("Manager")
                    .lastName("Achats")
                    .role(Role.MANAGER)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build());
            userRepo.save(UserJpaEntity.builder()
                    .id(UUID.randomUUID())
                    .email("user@stockpilot.com")
                    .passwordHash(encoder.encode("User@1234"))
                    .firstName("Magasinier")
                    .lastName("Stock")
                    .role(Role.USER)
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build());
            log.info("Auth seed created: admin@stockpilot.com/Admin@1234, manager@stockpilot.com/Manager@1234, user@stockpilot.com/User@1234");
        }
    }
}
