package com.exmple.stockpilot.auth.infrastructure.seed;

import com.exmple.stockpilot.Warehouse.application.port.out.WarehouseRepository;
import com.exmple.stockpilot.Warehouse.domain.model.Warehouse;
import com.exmple.stockpilot.Warehouse.domain.valueObject.Location;
import com.exmple.stockpilot.auth.domain.enums.Role;
import com.exmple.stockpilot.auth.infrastructure.persistence.SpringDataUserRepository;
import com.exmple.stockpilot.auth.infrastructure.persistence.UserJpaEntity;
import com.exmple.stockpilot.product.application.port.out.ProductRepository;
import com.exmple.stockpilot.product.domain.model.Product;
import com.exmple.stockpilot.product.domain.valueobject.Price;
import com.exmple.stockpilot.product.domain.valueobject.ProductCategory;
import com.exmple.stockpilot.product.domain.valueobject.SKU;
import com.exmple.stockpilot.product.domain.valueobject.UnitOfMeasure;
import com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence.PurchasingInfoRecordJpaEntity;
import com.exmple.stockpilot.purchasinginforecord.infrastructure.persistence.SpringDataPurchasingInfoRecordRepository;
import com.exmple.stockpilot.supplier.application.port.out.SupplierRepository;
import com.exmple.stockpilot.supplier.domain.model.Supplier;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final SpringDataUserRepository userRepo;
    private final PasswordEncoder encoder;
    private final WarehouseRepository warehouseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final SpringDataPurchasingInfoRecordRepository pirRepository;

    @Override
    public void run(String... args) {
        seedUsers();
        seedMasterData();
    }

    private void seedUsers() {
        createIfMissing("admin@stockpilot.com", "Admin@1234", "Admin", "StockPilot", Role.ADMIN);
        createIfMissing("manager@stockpilot.com", "Manager@1234", "Manager", "Achats", Role.MANAGER);
        createIfMissing("user@stockpilot.com", "User@1234", "Magasinier", "Stock", Role.USER);
    }

    private void seedMasterData() {
        // 1. Entrepôt central
        Warehouse warehouse;
        List<Warehouse> warehouses = warehouseRepository.findAll();
        if (warehouses.isEmpty()) {
            warehouse = Warehouse.create(
                    "Entrepôt Central Lyon",
                    Location.create("12 Rue des Industries", "Lyon", "France", "69007")
            );
            warehouse = warehouseRepository.save(warehouse);
            log.info("Seeded default warehouse: {}", warehouse.getName());
        } else {
            warehouse = warehouses.get(0);
        }

        // 2. Fournisseurs
        Supplier acme = findOrCreateSupplier(
                "Acme Industrial Supplies",
                "contact@acme-ind.com",
                "+33 4 78 00 11 22",
                "Zone Industrielle Est, 69100 Villeurbanne",
                "FR12345678901",
                "NET_30"
        );

        Supplier electroTech = findOrCreateSupplier(
                "ElectroTech Solutions",
                "sales@electrotech.fr",
                "+33 1 45 67 89 00",
                "Parc Technologique, 91400 Orsay",
                "FR98765432109",
                "NET_45"
        );

        Supplier globalParts = findOrCreateSupplier(
                "Global Parts Logistics",
                "orders@globalparts.com",
                "+33 2 40 12 34 56",
                "Port Fluvial, 44000 Nantes",
                "FR45678901234",
                "NET_30"
        );

        // 3. Articles (Material Master)
        Product motor = findOrCreateProduct(
                "Moteur Électrique Triphasé 5kW",
                "Moteur asynchrone haut rendement IE3 400V 50Hz",
                "MOT-TRI-5KW",
                BigDecimal.valueOf(450.00),
                "PCS",
                ProductCategory.RAW_MATERIAL
        );

        Product bearing = findOrCreateProduct(
                "Roulement à Billes SKF 6204",
                "Roulement rigide à une rangée de billes haute vitesse",
                "ROU-SKF-6204",
                BigDecimal.valueOf(25.00),
                "PCS",
                ProductCategory.RAW_MATERIAL
        );

        Product cable = findOrCreateProduct(
                "Câble Cuivre Industriel 4mm²",
                "Câble souple multibrins résistant huiles et UV",
                "CAB-CUV-4MM",
                BigDecimal.valueOf(8.50),
                "M",
                ProductCategory.RAW_MATERIAL
        );

        // 4. Fiches Info Achat (PIR - Purchasing Info Records)
        // Moteur Triphasé avec Acme (Preferred, 420€, 3j, -8% dès 10 pcs)
        createPirIfMissing(
                motor.getId().value(),
                acme.getId().value(),
                "ACM-MTR-50",
                BigDecimal.valueOf(420.00),
                "EUR",
                3,
                2,
                10,
                BigDecimal.valueOf(8.0),
                true
        );

        // Moteur Triphasé avec Global Parts (440€, 7j, -12% dès 20 pcs)
        createPirIfMissing(
                motor.getId().value(),
                globalParts.getId().value(),
                "GPL-MOT-05",
                BigDecimal.valueOf(440.00),
                "EUR",
                7,
                1,
                20,
                BigDecimal.valueOf(12.0),
                false
        );

        // Roulement SKF avec Acme (Preferred, 22€, 2j, -10% dès 50 pcs)
        createPirIfMissing(
                bearing.getId().value(),
                acme.getId().value(),
                "ACM-SKF-6204",
                BigDecimal.valueOf(22.00),
                "EUR",
                2,
                10,
                50,
                BigDecimal.valueOf(10.0),
                true
        );

        // Roulement SKF avec ElectroTech (24.50€, 5j, -15% dès 100 pcs)
        createPirIfMissing(
                bearing.getId().value(),
                electroTech.getId().value(),
                "ETS-RLM-6204",
                BigDecimal.valueOf(24.50),
                "EUR",
                5,
                5,
                100,
                BigDecimal.valueOf(15.0),
                false
        );

        // Câble Cuivre avec ElectroTech (Preferred, 7.80€, 4j, -12% dès 200m)
        createPirIfMissing(
                cable.getId().value(),
                electroTech.getId().value(),
                "ETS-CAB-004",
                BigDecimal.valueOf(7.80),
                "EUR",
                4,
                50,
                200,
                BigDecimal.valueOf(12.0),
                true
        );
    }

    private Supplier findOrCreateSupplier(String name, String email, String phone, String address, String taxNumber, String paymentTerms) {
        return supplierRepository.getAllSuppliers().stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Supplier s = Supplier.create(
                            name,
                            ContactInfo.of(email, phone),
                            address,
                            taxNumber,
                            paymentTerms,
                            "EUR"
                    );
                    Supplier saved = supplierRepository.save(s);
                    log.info("Seeded supplier: {}", saved.getName());
                    return saved;
                });
    }

    private Product findOrCreateProduct(String name, String description, String skuVal, BigDecimal price, String uom, ProductCategory cat) {
        SKU sku = SKU.of(skuVal);
        return productRepository.findBySku(sku).orElseGet(() -> {
            Product p = Product.create(
                    name,
                    description,
                    sku,
                    Price.of(price, "EUR"),
                    UnitOfMeasure.of(uom),
                    cat
            );
            Product saved = productRepository.save(p);
            log.info("Seeded product: {} ({})", saved.getName(), skuVal);
            return saved;
        });
    }

    private void createPirIfMissing(
            UUID productId,
            UUID supplierId,
            String partNumber,
            BigDecimal price,
            String currency,
            int leadTimeDays,
            int minOrderQty,
            int discountQty,
            BigDecimal discountPct,
            boolean preferred
    ) {
        if (pirRepository.findByProductIdAndSupplierId(productId, supplierId).isEmpty()) {
            PurchasingInfoRecordJpaEntity entity = PurchasingInfoRecordJpaEntity.builder()
                    .id(UUID.randomUUID())
                    .productId(productId)
                    .supplierId(supplierId)
                    .supplierPartNumber(partNumber)
                    .baseUnitPrice(price)
                    .currency(currency)
                    .leadTimeDays(leadTimeDays)
                    .minOrderQuantity(minOrderQty)
                    .discountTierQuantity(discountQty)
                    .discountPercentage(discountPct)
                    .preferred(preferred)
                    .active(true)
                    .build();
            pirRepository.save(entity);
            log.info("Seeded PIR: Part #{} for Product {}", partNumber, productId);
        }
    }

    private void createIfMissing(String email, String rawPassword, String firstName, String lastName, Role role) {
        if (userRepo.existsByEmail(email)) {
            return;
        }
        Instant now = Instant.now();
        userRepo.save(UserJpaEntity.builder()
                .email(email)
                .passwordHash(encoder.encode(rawPassword))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(now)
                .updatedAt(now)
                .build());
        log.info("Auth seed created user {} with role {}", email, role);
    }
}