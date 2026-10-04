package com.exmple.stockpilot.Warehouse.domain.model;

import com.exmple.stockpilot.Warehouse.domain.enums.WarehouseStatus;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Warehouse Domain Model Tests")
class WarehouseTest {

    @Test
    @DisplayName("Should create warehouse with default active status")
    void shouldCreateWarehouseWithActiveStatus() {
        Location location = Location.create("12 Rue de l'Industrie", "Lyon", "France", "69001");
        Warehouse warehouse = Warehouse.create("Central Hub", location);

        assertNotNull(warehouse.getId());
        assertEquals("Central Hub", warehouse.getName());
        assertEquals(location, warehouse.getLocation());
        assertEquals(WarehouseStatus.ACTIVE, warehouse.getStatus());
    }

    @Test
    @DisplayName("Location should require non-null address components")
    void shouldValidateLocationComponents() {
        assertThrows(NullPointerException.class, () ->
                Location.create(null, "Paris", "France", "75001")
        );
        assertThrows(NullPointerException.class, () ->
                Location.create("1 Rue Royale", null, "France", "75001")
        );
        assertThrows(NullPointerException.class, () ->
                Location.create("1 Rue Royale", "Paris", null, "75001")
        );
        assertThrows(NullPointerException.class, () ->
                Location.create("1 Rue Royale", "Paris", "France", null)
        );
    }
}
