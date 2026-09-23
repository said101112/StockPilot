package com.exmple.stockpilot.product.domain.valueobject;

/**
 * Taxonomie des catégories d'articles inspirée des standards ERP industriels (SAP MM Material Types : ROH, HALB, FERT, ERSA, etc.)
 */
public enum ProductCategory {
    // 1. Production & Fabrication
    RAW_MATERIAL("Matière Première", "Production & Fabrication", "Intrants bruts, métaux, plastiques, granulés, résines"),
    SEMI_FINISHED("Produit Semi-Fini", "Production & Fabrication", "Sous-ensembles, pièces usinées en cours d'assemblage"),
    FINISHED_GOOD("Produit Fini", "Production & Fabrication", "Articles finis prêts pour expédition, vente ou livraison client"),

    // 2. Maintenance & Exploitation (MRO)
    SPARE_PART("Pièce de Rechange", "Maintenance & Exploitation (MRO)", "Roulements, joints, moteurs, composants de maintenance industrielle"),
    EQUIPMENT("Équipement & Outillage", "Maintenance & Exploitation (MRO)", "Machines-outils, outillage professionnel, instrumentation de mesure"),
    CHEMICALS("Produits Chimiques & Lubrifiants", "Maintenance & Exploitation (MRO)", "Huiles, graisses techniques, solvants, dégraissants, résines"),

    // 3. Logistique & Conditionnement
    PACKAGING("Emballage & Conditionnement", "Logistique & Conditionnement", "Cartons, palettes Europe, films étirables, feuillards, calages"),
    CONSUMABLE("Consommable d'Atelier", "Logistique & Conditionnement", "Étiquettes codes-barres, rouleaux adhésifs, consommables d'impression"),

    // 4. Sécurité & Support
    SAFETY_EQUIPMENT("EPI & Sécurité", "Sécurité & Services Généraux", "Casques, gants de protection, chaussures de sécurité, masques"),
    OFFICE_SUPPLY("Bureautique & IT", "Sécurité & Services Généraux", "Matériel informatique, serveurs, câblage réseau, fournitures de bureau"),
    SERVICE("Prestation & Service", "Sécurité & Services Généraux", "Maintenance préventive externe, étalonnage, transport, sous-traitance");

    private final String label;
    private final String group;
    private final String description;

    ProductCategory(String label, String group, String description) {
        this.label = label;
        this.group = group;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getGroup() {
        return group;
    }

    public String getDescription() {
        return description;
    }

    public static ProductCategory fromString(String value) {
        if (value == null || value.isBlank()) {
            return FINISHED_GOOD; // Valeur par défaut
        }
        String normalized = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        
        // Aliases courants
        if (normalized.equals("OFFICE_SUPPLIES")) return OFFICE_SUPPLY;
        if (normalized.equals("SPARE_PARTS")) return SPARE_PART;
        if (normalized.equals("RAW_MATERIALS")) return RAW_MATERIAL;
        if (normalized.equals("CONSUMABLES")) return CONSUMABLE;
        if (normalized.equals("SERVICES")) return SERVICE;
        if (normalized.equals("CHEMICAL") || normalized.equals("CHIMIQUE")) return CHEMICALS;
        if (normalized.equals("PACKAGINGS") || normalized.equals("EMBALLAGE")) return PACKAGING;
        if (normalized.equals("EPI") || normalized.equals("SAFETY")) return SAFETY_EQUIPMENT;

        try {
            return ProductCategory.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return FINISHED_GOOD;
        }
    }
}
