package com.exmple.stockpilot.auth.infrastructure.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {
    private String secret;
    private String issuer = "stockpilot";
    private long accessTtlMinutes = 60;
    private long refreshTtlDays = 7;
}
