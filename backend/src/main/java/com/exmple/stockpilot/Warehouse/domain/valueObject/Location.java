package com.exmple.stockpilot.Warehouse.domain.valueObject;

import java.util.Objects;

public record Location(String address, String city, String country, String zipCode) {

    public Location{
        Objects.requireNonNull(address, "Address cannot be null");
        Objects.requireNonNull(city, "City cannot be null");
        Objects.requireNonNull(country, "Country cannot be null");
        Objects.requireNonNull(zipCode, "Zip code cannot be null");
    }

        public static Location create(String address, String city, String country, String zipCode) {
        return new Location(address, city, country, zipCode);
    }
    
}