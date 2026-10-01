package com.exmple.stockpilot.auth.infrastructure.security;

import com.exmple.stockpilot.auth.infrastructure.persistence.SpringDataUserRepository;
import com.exmple.stockpilot.auth.infrastructure.persistence.UserJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    private final SpringDataUserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserJpaEntity e = repo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new org.springframework.security.core.userdetails.User(
                e.getEmail(),
                e.getPasswordHash(),
                e.isEnabled(),
                e.isAccountNonExpired(),
                e.isCredentialsNonExpired(),
                e.isAccountNonLocked(),
                List.of(new SimpleGrantedAuthority("ROLE_" + e.getRole().name()))
        );
    }
}
