package com.exmple.stockpilot.product.domain.valueobject;
import java.math.BigDecimal;
import java.util.Objects;
public record Price(BigDecimal amount,String currency) {
    public Price {
        Objects.requireNonNull(amount, "Amount cannot be null");
        Objects.requireNonNull(currency, "Currency cannot be null");
        if(amount.compareTo(BigDecimal.ZERO)<0){
             throw new IllegalArgumentException("Price cannot be negative");
        }
    }
      public static Price of(BigDecimal amount, String currency) {
        return new Price(amount, currency);
    }

    
}


