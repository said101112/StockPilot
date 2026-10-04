package com.exmple.stockpilot.supplier.domain.model;

import com.exmple.stockpilot.supplier.domain.enums.SupplierStatus;
import com.exmple.stockpilot.supplier.domain.valueObject.ContactInfo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SupplierTest {

    @Test
    @DisplayName("Devrait créer un fournisseur valide")
    void shouldCreateValidSupplier() {
        ContactInfo contact = ContactInfo.of("contact@acme.com", "+33 1 45 67 89 00");

        Supplier supplier = Supplier.create(
                "Acme Corp Industrial",
                contact,
                "12 rue des Usines, 75001 Paris",
                "FR12345678901",
                "NET_60",
                "EUR"
        );

        assertThat(supplier.getId()).isNotNull();
        assertThat(supplier.getName()).isEqualTo("Acme Corp Industrial");
        assertThat(supplier.getContactInfo().email()).isEqualTo("contact@acme.com");
        assertThat(supplier.getContactInfo().phoneNumber()).isEqualTo("+33 1 45 67 89 00");
        assertThat(supplier.getAddress()).isEqualTo("12 rue des Usines, 75001 Paris");
        assertThat(supplier.getTaxNumber()).isEqualTo("FR12345678901");
        assertThat(supplier.getPaymentTerms()).isEqualTo("NET_60");
        assertThat(supplier.getCurrency()).isEqualTo("EUR");
        assertThat(supplier.getStatus()).isEqualTo(SupplierStatus.ACTIVE);
    }

    @Test
    @DisplayName("Devrait rejeter un nom de fournisseur vide ou trop court")
    void shouldRejectShortSupplierName() {
        ContactInfo contact = ContactInfo.of("valid@test.com", "0102030405");

        assertThatThrownBy(() -> Supplier.create("A", contact, "Address", "FR123", "NET_30", "EUR"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Supplier name must have at least 2 characters");
    }

    @Test
    @DisplayName("Devrait valider le format de l'email de contact")
    void shouldValidateContactEmail() {
        assertThatThrownBy(() -> ContactInfo.of("invalid-email", "0102030405"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email format");
    }

    @Test
    @DisplayName("Devrait valider que le numéro de téléphone n'est pas vide")
    void shouldValidateContactPhone() {
        assertThatThrownBy(() -> ContactInfo.of("valid@email.com", "   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Phone number cannot be blank");
    }

    @Test
    @DisplayName("Devrait désactiver puis réactiver un fournisseur")
    void shouldToggleSupplierStatus() {
        Supplier supplier = Supplier.create(
                "Fournisseur Global",
                ContactInfo.of("info@global.com", "+33 9 87 65 43 21"),
                "Lyon",
                "FR99999",
                "NET_30",
                "EUR"
        );

        supplier.deactivate();
        assertThat(supplier.getStatus()).isEqualTo(SupplierStatus.INACTIVE);

        supplier.activate();
        assertThat(supplier.getStatus()).isEqualTo(SupplierStatus.ACTIVE);
    }
}
