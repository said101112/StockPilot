package com.exmple.stockpilot.Warehouse.application.service;

import com.exmple.stockpilot.Warehouse.application.port.out.WarehouseRepository;
import com.exmple.stockpilot.Warehouse.domain.enums.WarehouseStatus;
import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.Warehouse.domain.valueObject.WarehouseId;
import com.exmple.stockpilot.Warehouse.presentation.CreateWarehouseRequest;
import com.exmple.stockpilot.Warehouse.presentation.WarehouseResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WarehouseApplicationService Unit Tests")
class WarehouseApplicationServiceTest {

    @Mock
    private WarehouseRepository repository;

    private WarehouseApplicationService service;

    @BeforeEach
    void setUp() {
        service = new WarehouseApplicationService(repository);
    }

    @Test
    @DisplayName("Should create warehouse successfully")
    void shouldCreateWarehouse() {
        CreateWarehouseRequest request = new CreateWarehouseRequest(
                "Marseille Hub",
                "Port Autonome",
                "Marseille",
                "France",
                "13000"
        );

        when(repository.save(any(Warehouse.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("Marseille Hub", response.name());
        assertEquals("Marseille", response.city());
        verify(repository, times(1)).save(any(Warehouse.class));
    }

    @Test
    @DisplayName("Should get all warehouses")
    void shouldGetAllWarehouses() {
        Warehouse w = Warehouse.create("Lyon Hub", Location.create("Rue A", "Lyon", "France", "69000"));
        when(repository.findAll()).thenReturn(List.of(w));

        List<WarehouseResponse> all = service.getAllWarehouses();

        assertEquals(1, all.size());
    }

    @Test
    @DisplayName("Should get warehouse by ID")
    void shouldGetWarehouseById() {
        UUID id = UUID.randomUUID();
        Warehouse w = Warehouse.create("Bordeaux Hub", Location.create("Rue B", "Bordeaux", "France", "33000"));
        when(repository.findById(WarehouseId.from(id))).thenReturn(Optional.of(w));

        WarehouseResponse response = service.getWarehouseById(id);

        assertNotNull(response);
        assertEquals("Bordeaux Hub", response.name());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when warehouse not found by ID")
    void shouldThrowWhenWarehouseNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(WarehouseId.from(id))).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.getWarehouseById(id));
    }

    @Test
    @DisplayName("Should return existing active warehouse as default warehouse")
    void shouldReturnDefaultWarehouse() {
        Warehouse activeWh = Warehouse.create("Central", Location.create("Zone Nord", "Paris", "France", "75000"));
        when(repository.findAll()).thenReturn(List.of(activeWh));

        WarehouseResponse response = service.getDefaultWarehouse();

        assertNotNull(response);
        assertEquals("Central", response.name());
    }
}
