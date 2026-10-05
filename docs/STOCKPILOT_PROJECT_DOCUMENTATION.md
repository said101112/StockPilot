# 📦 StockPilot — Documentation Complète du Projet

> **Version** : 0.1.0-SNAPSHOT  
> **Stack Technique** : Spring Boot 4.1 (Java 17) + React/TypeScript (Vite) + PostgreSQL  
> **Dernière mise à jour** : Octobre 2026

---

## Table des Matières

1. [Vue d'Ensemble du Projet](#1-vue-densemble-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Modules Fonctionnels](#3-modules-fonctionnels)
4. [Flux P2P Complet (Procure-to-Pay)](#4-flux-p2p-complet-procure-to-pay)
5. [Gestion des Rôles & Permissions (RBAC)](#5-gestion-des-rôles--permissions-rbac)
6. [Règles Métier & Validations](#6-règles-métier--validations)
7. [API REST — Référence Complète](#7-api-rest--référence-complète)
8. [Données de Test (Seed Data)](#8-données-de-test-seed-data)
9. [Scénarios de Test End-to-End](#9-scénarios-de-test-end-to-end)
10. [Structure des Fichiers du Projet](#10-structure-des-fichiers-du-projet)

---

## 1. Vue d'Ensemble du Projet

**StockPilot** est un ERP de gestion des stocks et approvisionnement inspiré du module **SAP MM (Material Management)**. Il couvre l'intégralité du cycle **Procure-to-Pay (P2P)** :

```
Besoin interne → Demande d'Achat → Commande Fournisseur → Réception Marchandise → Mise en stock
```

### Objectifs principaux

| Objectif | Description |
|----------|-------------|
| **Gestion centralisée des stocks** | Suivi en temps réel des quantités par article et par entrepôt |
| **Processus P2P complet** | Du besoin exprimé à la réception physique en magasin |
| **Séparation des tâches (SoD)** | Un demandeur ne peut pas approuver sa propre demande |
| **Alertes automatiques** | Détection de rupture / seuil bas avec niveaux de sévérité |
| **Traçabilité complète** | Journal d'audit de tous les mouvements de stock |
| **Tarification intelligente** | Remises dégressives via Fiche Info Achat (PIR) |

---

## 2. Architecture Technique

### 2.1 Stack technologique

| Couche | Technologie | Version |
|--------|------------|---------|
| **Backend** | Spring Boot | 4.1.1 |
| **ORM** | Spring Data JPA / Hibernate | — |
| **Sécurité** | Spring Security + JWT (jjwt 0.12.6) | — |
| **Base de données** | PostgreSQL | — |
| **Frontend** | React + TypeScript | — |
| **Build Frontend** | Vite | — |
| **Langage Backend** | Java | 17 |
| **Librairie utilitaire** | Lombok | — |

### 2.2 Architecture Hexagonale (Clean Architecture / DDD)

Chaque module (bounded context) suit la même structure en 4 couches :

```
module/
├── domain/              ← Cœur métier pur (aucune dépendance framework)
│   ├── model/               ← Entités et Agrégats (ex: PurchaseOrder.java)
│   ├── enums/               ← Énumérations métier (ex: PurchaseOrderStatus)
│   ├── valueobject/         ← Value Objects (ex: ProductId, Price, SKU)
│   └── exception/           ← Exceptions métier (ex: SupplierNotFoundException)
│
├── application/          ← Orchestration (Use Cases / Application Services)
│   ├── port/
│   │   ├── in/              ← Ports d'entrée (interfaces Use Case)
│   │   └── out/             ← Ports de sortie (interfaces Repository)
│   └── service/             ← Implémentation des Use Cases
│
├── infrastructure/       ← Adaptateurs techniques (JPA, mappers)
│   └── persistence/
│       ├── *JpaEntity.java       ← Entités JPA (annotations @Entity)
│       ├── SpringData*Repository  ← Interfaces Spring Data
│       └── *PersistenceAdapter    ← Adapte JPA vers Domaine
│
└── presentation/         ← Couche HTTP (REST API)
    ├── *Controller.java     ← Contrôleurs REST (@RestController)
    ├── *Request.java        ← DTOs d'entrée (requêtes)
    └── *Response.java       ← DTOs de sortie (réponses)
```

### 2.3 Architecture Frontend (React)

```
frontend/src/
├── components/           ← Composants UI réutilisables (Button, Badge, Modal...)
├── context/              ← Contextes React (AuthContext, SidebarContext)
├── features/             ← Feature modules (auth, inventory, procurement, etc.)
│   └── <feature>/
│       ├── api/             ← Appels HTTP (xxxApi.ts)
│       ├── components/      ← Composants spécifiques au module
│       └── domain/          ← Types TypeScript
├── layout/               ← Layout de l'application (AppSidebar, AppHeader)
├── pages/                ← Pages par module (routable via React Router)
├── hooks/                ← Custom hooks (useAuth)
└── shared/               ← Utilitaires partagés (ToastContext, etc.)
```

---

## 3. Modules Fonctionnels

---

### 3.1 Authentification & Sécurité (Auth)

#### Objectif
Gestion de l'identité utilisateur, connexion/inscription, et contrôle d'accès basé sur les rôles (RBAC).

#### Modèle de domaine — `User`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Identifiant unique |
| `email` | `String` | Adresse e-mail (unique, login) |
| `passwordHash` | `String` | Mot de passe hashé (BCrypt) |
| `firstName` | `String` | Prénom |
| `lastName` | `String` | Nom |
| `role` | `Role` | Rôle assigné : `ADMIN`, `MANAGER`, `USER` |
| `enabled` | `boolean` | Compte actif |
| `accountNonExpired` | `boolean` | Compte non expiré |
| `accountNonLocked` | `boolean` | Compte non verrouillé |
| `credentialsNonExpired` | `boolean` | Identifiants non expirés |
| `createdAt` | `Instant` | Date de création |
| `updatedAt` | `Instant` | Dernière modification |

#### Mécanisme d'authentification

```
1. POST /api/auth/login  → { email, password }
2. Serveur vérifie identifiants → génère un JWT Access Token + Refresh Token
3. Chaque requête API → Header: Authorization: Bearer <accessToken>
4. Expiration → POST /api/auth/refresh → { refreshToken } → nouveau JWT
```

#### Stockage côté frontend

| Clé localStorage | Description |
|------------------|-------------|
| `sp_access_token` | JWT d'accès |
| `sp_refresh_token` | JWT de rafraîchissement |
| `sp_user` | Données utilisateur sérialisées (JSON) |

#### Rôles applicatifs

| Rôle | Description SAP équivalent |
|------|---------------------------|
| `ADMIN` | Administrateur Système — accès total |
| `MANAGER` | Acheteur / Responsable Achats — approuve, commande |
| `USER` | Magasinier / Warehouse Clerk — demande, réceptionne |

---

### 3.2 Gestion des Fournisseurs (Supplier / Vendor Master)

#### Objectif
Référentiel centralisé des fournisseurs avec leurs informations contractuelles et fiscales.

#### Modèle de domaine — `Supplier`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `SupplierId` (UUID) | Identifiant unique |
| `name` | `String` | Raison sociale (min. 2 car.) |
| `contactInfo` | `ContactInfo` | E-mail + Téléphone (Value Object) |
| `address` | `String` | Adresse physique |
| `taxNumber` | `String` | Numéro fiscal / TVA |
| `paymentTerms` | `String` | Conditions de paiement (défaut: `NET_30`) |
| `currency` | `String` | Devise (défaut: `EUR`) |
| `status` | `SupplierStatus` | `ACTIVE` ou `INACTIVE` |

#### Règles métier

- Le nom doit faire au minimum 2 caractères
- L'e-mail et le téléphone sont obligatoires (`ContactInfo`)
- Les conditions de paiement par défaut = `NET_30`
- La devise par défaut = `EUR`
- Un fournisseur peut être désactivé/réactivé

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/suppliers` | ADMIN, MANAGER, USER | Liste tous les fournisseurs |
| `GET` | `/api/suppliers/{id}` | ADMIN, MANAGER, USER | Détail d'un fournisseur |
| `POST` | `/api/suppliers` | ADMIN, MANAGER | Créer un fournisseur |
| `PUT` | `/api/suppliers/{id}` | ADMIN, MANAGER | Modifier un fournisseur |
| `DELETE` | `/api/suppliers/{id}` | ADMIN | Supprimer un fournisseur |

---

### 3.3 Catalogue des Articles (Product / Material Master)

#### Objectif
Fiche article complète avec prix catalogue, catégorisation et unité de mesure.

#### Modèle de domaine — `Product`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `ProductId` (UUID) | Identifiant unique |
| `name` | `String` | Nom de l'article (min. 2 car.) |
| `description` | `String` | Description détaillée |
| `sku` | `SKU` | Référence article unique (Value Object) |
| `price` | `Price` | Prix catalogue (montant + devise, Value Object) |
| `unitOfMeasure` | `UnitOfMeasure` | Unité de mesure (`PCS`, `M`, `KG`, `L`...) |
| `category` | `ProductCategory` | Catégorie (`RAW_MATERIAL`, `FINISHED_GOOD`, etc.) |
| `status` | `ProductStatus` | `ACTIVE` ou `INACTIVE` |

#### Value Objects

| Value Object | Champs | Validation |
|-------------|--------|------------|
| `SKU` | `value: String` | Non vide, trimmed |
| `Price` | `amount: BigDecimal`, `currency: String` | `amount > 0` |
| `UnitOfMeasure` | `value: String` | Non vide |

#### Catégories d'articles (`ProductCategory`)

| Valeur | Description |
|--------|-------------|
| `RAW_MATERIAL` | Matière première / composant |
| `FINISHED_GOOD` | Produit fini |
| `SEMI_FINISHED` | Produit semi-fini |
| `SPARE_PART` | Pièce de rechange |
| `CONSUMABLE` | Consommable |

#### Règles métier

- Le nom doit contenir au minimum 2 caractères
- Le SKU est obligatoire et unique
- Le prix doit être strictement positif
- Un article peut être désactivé/réactivé
- Les détails (nom, description, prix, catégorie, UoM) sont modifiables

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/products` | ADMIN, MANAGER, USER | Liste des articles |
| `GET` | `/api/products/{id}` | ADMIN, MANAGER, USER | Détail d'un article |
| `POST` | `/api/products` | ADMIN | Créer un article |
| `PUT` | `/api/products/{id}` | ADMIN | Modifier un article |
| `DELETE` | `/api/products/{id}` | ADMIN | Supprimer un article |

---

### 3.4 Entrepôts (Warehouse)

#### Objectif
Représente les lieux physiques de stockage (magasins, dépôts).

#### Modèle de domaine — `Warehouse`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `WarehouseId` (UUID) | Identifiant unique |
| `name` | `String` | Nom de l'entrepôt |
| `location` | `Location` | Adresse (rue, ville, pays, code postal) — Value Object |
| `status` | `WarehouseStatus` | `ACTIVE` ou `INACTIVE` |

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/warehouses` | ADMIN, MANAGER, USER | Liste des entrepôts |
| `POST` | `/api/warehouses` | ADMIN | Créer un entrepôt |

---

### 3.5 Inventaire (Inventory)

#### Objectif
Suivi en temps réel du stock physique par couple (Article x Entrepôt). Gère les réservations, consommations et mises au rebut.

#### Modèle de domaine — `Inventory`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `InventoryId` (UUID) | Identifiant unique |
| `productId` | `ProductId` | Article concerné |
| `warehouseId` | `WarehouseId` | Entrepôt concerné |
| `quantityOnHand` | `int` | Quantité physiquement en stock |
| `reservedQuantity` | `int` | Quantité réservée (non disponible) |
| `reorderPoint` | `int` | Seuil de réapprovisionnement |
| `status` | `InventoryStatus` | Statut calculé automatiquement |

#### Statuts d'inventaire (`InventoryStatus`)

| Statut | Condition |
|--------|-----------|
| `IN_STOCK` | `(quantityOnHand - reservedQuantity) > reorderPoint` |
| `LOW_STOCK` | `0 < (quantityOnHand - reservedQuantity) <= reorderPoint` |
| `OUT_OF_STOCK` | `(quantityOnHand - reservedQuantity) <= 0` |

#### Opérations de stock

| Opération | Description | Rôle requis |
|-----------|-------------|-------------|
| **Créer un inventaire** | Initialise le stock pour un article dans un entrepôt | ADMIN, MANAGER |
| **Augmenter le stock** | Ajoute des unités (ex: après réception) | ADMIN, MANAGER |
| **Consommer du stock** | Retire des unités (sortie interne) | ADMIN, MANAGER, USER |
| **Réserver du stock** | Bloque des unités (pré-allocation) | ADMIN, MANAGER |
| **Mise au rebut (Scrap)** | Déclare des pièces cassées/défectueuses | ADMIN, MANAGER, USER |

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/inventories` | Tous | Lister tout l'inventaire |
| `GET` | `/api/inventories/{id}` | Tous | Détail d'une ligne |
| `GET` | `/api/inventories/product/{pid}/warehouse/{wid}` | Tous | Recherche par article + entrepôt |
| `POST` | `/api/inventories` | ADMIN, MANAGER | Créer une ligne d'inventaire |
| `POST` | `/api/inventories/{id}/consume` | Tous | Consommer du stock |
| `POST` | `/api/inventories/{id}/reserve` | ADMIN, MANAGER | Réserver du stock |
| `POST` | `/api/inventories/{id}/increase` | ADMIN, MANAGER | Augmenter le stock |
| `POST` | `/api/inventories/{id}/scrap` | Tous | Déclarer rebut |

---

### 3.6 Fiche Info Achat (PIR - Purchasing Info Record)

#### Objectif
Établit la **relation contractuelle** entre un Article et un Fournisseur. Centralise les prix négociés, les paliers de remise, les délais de livraison et les quantités minimales de commande.

> **Équivalent SAP** : Transaction ME11/ME12 — Info Record

#### Modèle de domaine — `PurchasingInfoRecord`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Identifiant unique |
| `productId` | `UUID` | Article associé |
| `supplierId` | `UUID` | Fournisseur associé |
| `supplierPartNumber` | `String` | Référence article chez le fournisseur |
| `baseUnitPrice` | `BigDecimal` | Prix unitaire de base négocié |
| `currency` | `String` | Devise (défaut: `EUR`) |
| `leadTimeDays` | `int` | Délai de livraison moyen (en jours, min. 1) |
| `minOrderQuantity` | `int` | Quantité minimale de commande (MOQ, min. 1) |
| `discountTierQuantity` | `int` | Seuil de volume pour la remise |
| `discountPercentage` | `BigDecimal` | Pourcentage de remise au-delà du seuil |
| `preferred` | `boolean` | Fournisseur préféré pour cet article |
| `active` | `boolean` | Fiche active |

#### Calcul du prix effectif

```java
// Si quantity >= discountTierQuantity ET discountPercentage > 0 :
prixEffectif = baseUnitPrice * (1 - discountPercentage / 100)

// Sinon :
prixEffectif = baseUnitPrice
```

**Exemple concret :**
- Article : Moteur Triphasé 5kW
- Fournisseur : Acme (Preferred)
- Prix de base : 420,00 EUR
- Seuil de remise : 10 pièces
- Remise : 8%
- Si commande de 15 pièces → Prix effectif = 420 x 0,92 = **386,40 EUR/pièce**

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/purchasing-info-records` | Tous | Liste toutes les fiches |
| `GET` | `/api/purchasing-info-records/product/{productId}` | Tous | Fiches pour un article |
| `POST` | `/api/purchasing-info-records` | ADMIN, MANAGER | Créer une fiche |
| `PUT` | `/api/purchasing-info-records/{id}` | ADMIN, MANAGER | Modifier une fiche |

---

### 3.7 Demande d'Achat (DA - Purchase Requisition)

#### Objectif
Formalise un **besoin interne** en approvisionnement. Le magasinier identifie un manque et crée une demande qui sera examinée par l'acheteur.

> **Équivalent SAP** : Transaction ME51N — Création de Demande d'Achat

#### Modèle de domaine — `PurchaseRequisition`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `PurchaseRequisitionId` (UUID) | Identifiant unique |
| `prNumber` | `String` | Numéro de DA (ex: `PR-20261002-001`) |
| `productId` | `ProductId` | Article demandé |
| `warehouseId` | `WarehouseId` | Entrepôt destinataire |
| `requestedQuantity` | `int` | Quantité demandée (> 0) |
| `requestedDeliveryDate` | `LocalDate` | Date de livraison souhaitée (défaut: J+7) |
| `justification` | `String` | Motif de la demande |
| `status` | `PurchaseRequisitionStatus` | État du cycle de vie |
| `rejectionReason` | `String` | Motif de refus (si rejeté) |
| `createdAt` | `LocalDateTime` | Date de création |
| `submittedAt` | `LocalDateTime` | Date de soumission |

#### Machine d'états — Cycle de vie de la DA

```
[*] --> DRAFT
DRAFT --> SUBMITTED       (via submit())
SUBMITTED --> APPROVED    (via approve())
SUBMITTED --> REJECTED    (via reject(reason))
APPROVED --> ORDERED      (via markAsOrdered())
```

| Transition | Condition | Action |
|------------|-----------|--------|
| `DRAFT -> SUBMITTED` | Statut actuel = DRAFT | Horodatage `submittedAt` |
| `SUBMITTED -> APPROVED` | Statut actuel = SUBMITTED | — |
| `SUBMITTED -> REJECTED` | Statut actuel = SUBMITTED | Enregistrement du motif |
| `APPROVED -> ORDERED` | Statut actuel = APPROVED | Transformation en PO |

#### Règles métier

- Le numéro PR ne peut pas être vide
- La quantité demandée doit être strictement positive
- La quantité ne peut être modifiée que si le statut = `DRAFT`
- Seule une DA en `DRAFT` peut être soumise
- Seule une DA en `SUBMITTED` peut être approuvée ou rejetée
- Seule une DA `APPROVED` peut être transformée en commande

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/purchase-requisitions` | Tous | Liste des DA |
| `GET` | `/api/purchase-requisitions/{id}` | Tous | Détail d'une DA |
| `POST` | `/api/purchase-requisitions` | Tous | Créer une DA (brouillon) |
| `POST` | `/api/purchase-requisitions/{id}/submit` | Tous | Soumettre une DA |
| `POST` | `/api/purchase-requisitions/{id}/approve` | ADMIN, MANAGER | Approuver une DA |
| `POST` | `/api/purchase-requisitions/{id}/reject` | ADMIN, MANAGER | Rejeter une DA |
| `PUT` | `/api/purchase-requisitions/{id}` | ADMIN, MANAGER | Modifier une DA |

---

### 3.8 Bon de Commande Fournisseur (PO - Purchase Order)

#### Objectif
Représente l'**engagement juridique et contractuel** auprès d'un fournisseur. Contient les lignes d'articles avec prix, quantités et conditions de paiement.

> **Équivalent SAP** : Transaction ME21N — Création de Commande d'Achat

#### Modèle de domaine — `PurchaseOrder`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `PurchaseOrderId` (UUID) | Identifiant unique |
| `poNumber` | `String` | Numéro de commande (ex: `PO-20261002-001`) |
| `requisitionId` | `PurchaseRequisitionId` | DA source (nullable pour commande directe) |
| `supplierId` | `SupplierId` | Fournisseur sélectionné |
| `warehouseId` | `WarehouseId` | Entrepôt de réception |
| `items` | `List<PurchaseOrderItem>` | Lignes de commande (min. 1) |
| `totalAmount` | `BigDecimal` | Montant total (calculé automatiquement) |
| `currency` | `String` | Devise (défaut: `EUR`) |
| `status` | `PurchaseOrderStatus` | État du cycle de vie |
| `expectedDeliveryDate` | `LocalDate` | Date de livraison prévue (défaut: J+10) |
| `paymentTerms` | `String` | Conditions de paiement (défaut: `NET_30`) |
| `createdAt` | `LocalDateTime` | Date de création |
| `issuedAt` | `LocalDateTime` | Date d'émission au fournisseur |

#### Sous-entité — `PurchaseOrderItem`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Identifiant unique de la ligne |
| `productId` | `ProductId` | Article commandé |
| `productName` | `String` | Nom de l'article |
| `sku` | `String` | Référence SKU |
| `orderedQuantity` | `int` | Quantité commandée (> 0) |
| `receivedQuantity` | `int` | Quantité déjà reçue |
| `unitPrice` | `BigDecimal` | Prix unitaire (> 0) |
| `totalPrice` | `BigDecimal` | `unitPrice x orderedQuantity` (calculé) |

#### Machine d'états — Cycle de vie du PO

```
[*] --> DRAFT
DRAFT --> ISSUED                 (via issue())
ISSUED --> PARTIALLY_RECEIVED    (via recordReceipt() - partiel)
ISSUED --> COMPLETED             (via recordReceipt() - tout reçu)
PARTIALLY_RECEIVED --> COMPLETED (via recordReceipt() - solde)
DRAFT --> CANCELLED              (via cancel())
ISSUED --> CANCELLED             (via cancel() si aucune réception)
```

| Statut | Description |
|--------|-------------|
| `DRAFT` | En cours de préparation par l'acheteur |
| `ISSUED` | Émis et envoyé officiellement au fournisseur |
| `PARTIALLY_RECEIVED` | Livraison partielle effectuée |
| `COMPLETED` | Commande intégralement reçue |
| `CANCELLED` | Commande annulée |

#### Règles métier

- Le numéro PO ne peut pas être vide
- Le fournisseur est obligatoire
- La commande doit contenir au moins 1 article
- Le montant total = somme des `unitPrice x orderedQuantity` pour chaque ligne
- Seul un PO en `DRAFT` peut être émis (`issue()`)
- Réception uniquement sur un PO `ISSUED` ou `PARTIALLY_RECEIVED`
- La quantité reçue ne peut pas dépasser la quantité commandée par ligne
- Annulation impossible si des marchandises ont déjà été reçues

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/purchase-orders` | Tous | Liste des commandes |
| `GET` | `/api/purchase-orders/{id}` | Tous | Détail d'une commande |
| `POST` | `/api/purchase-orders` | ADMIN, MANAGER | Créer une commande |
| `POST` | `/api/purchase-orders/{id}/issue` | ADMIN, MANAGER | Émettre la commande |
| `POST` | `/api/purchase-orders/{id}/cancel` | ADMIN, MANAGER | Annuler la commande |

---

### 3.9 Réception de Marchandises (GR - Goods Receipt)

#### Objectif
Atteste de l'**entrée physique** des marchandises dans l'entrepôt suite à une commande fournisseur. Met à jour les stocks et génère les mouvements de stock.

> **Équivalent SAP** : Transaction MIGO — Goods Receipt

#### Modèle de domaine — `GoodsReceipt`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `GoodsReceiptId` (UUID) | Identifiant unique |
| `grNumber` | `String` | Numéro de réception (ex: `GR-20261002-001`) |
| `purchaseOrderId` | `PurchaseOrderId` | Commande source |
| `deliveryNoteNumber` | `String` | Numéro du bon de livraison fournisseur (BL) |
| `items` | `List<GoodsReceiptItem>` | Lignes reçues |
| `receivedAt` | `LocalDateTime` | Date/heure de réception |
| `notes` | `String` | Observations |

#### Sous-entité — `GoodsReceiptItem`

| Champ | Type | Description |
|-------|------|-------------|
| `productId` | `ProductId` | Article reçu |
| `receivedQuantity` | `int` | Quantité effectivement reçue |

#### Effets de bord automatiques

Lors de la création d'un `GoodsReceipt`, le système déclenche automatiquement :

1. **Mise à jour du PO** : `purchaseOrder.recordReceipt(productId, quantity)` → changement de statut
2. **Augmentation du stock** : `inventory.increase(quantity)` pour chaque ligne
3. **Création de mouvement** : `StockMovement` de type `GOODS_RECEIPT_PO`
4. **Résolution d'alertes** : Si le stock remonte au-dessus du seuil → résolution automatique

#### Règles métier

- Le numéro GR ne peut pas être vide
- Le numéro de bon de livraison (BL) est obligatoire
- Au moins une ligne d'article est requise
- Lié obligatoirement à un PO existant

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/goods-receipts` | Tous | Liste des réceptions |
| `POST` | `/api/goods-receipts` | Tous | Créer une réception |

---

### 3.10 Mouvements de Stock (Stock Movements)

#### Objectif
**Journal d'audit immuable** de toute variation physique de stock. Chaque opération sur l'inventaire génère obligatoirement un enregistrement de mouvement.

> **Équivalent SAP** : Material Document (Types de mouvement 101, 201, 551, 561)

#### Modèle de domaine — `StockMovement`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `StockMovementId` (UUID) | Identifiant unique |
| `movementNumber` | `String` | Numéro du mouvement |
| `productId` | `ProductId` | Article concerné |
| `warehouseId` | `WarehouseId` | Entrepôt |
| `type` | `MovementType` | Type de mouvement |
| `quantity` | `int` | Quantité (> 0) |
| `referenceDocument` | `String` | Document de référence (n° PO, n° GR...) |
| `timestamp` | `LocalDateTime` | Horodatage |

#### Types de mouvement (`MovementType`)

| Type | Code SAP équivalent | Description |
|------|---------------------|-------------|
| `GOODS_RECEIPT_PO` | 101 | Entrée marchandise sur commande d'achat |
| `INTERNAL_CONSUMPTION` | 201 | Sortie de stock pour usage interne |
| `INITIAL_STOCK` | 561 | Initialisation de l'inventaire |
| `MANUAL_ADJUSTMENT` | — | Régularisation d'inventaire |
| `SCRAP_DAMAGED` | 551 | Sortie pour mise au rebut (pièce cassée) |

#### Règles métier

- Objet immuable : une fois créé, un mouvement ne peut pas être modifié
- La quantité doit être strictement positive
- Le type de mouvement est obligatoire
- Le numéro de mouvement ne peut pas être vide

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/stock-movements` | Tous | Historique complet |

---

### 3.11 Alertes de Stock (Stock Alerts)

#### Objectif
Système de **détection automatique** des niveaux de stock bas. Déclenché dès que le stock disponible passe sous le seuil de réapprovisionnement (`reorderPoint`).

#### Modèle de domaine — `StockAlert`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `StockAlertId` (UUID) | Identifiant unique |
| `productId` | `ProductId` | Article en alerte |
| `warehouseId` | `WarehouseId` | Entrepôt concerné |
| `currentStock` | `int` | Stock au moment de l'alerte |
| `reorderPoint` | `int` | Seuil de réapprovisionnement |
| `severity` | `AlertSeverity` | Niveau de sévérité (calculé) |
| `status` | `AlertStatus` | `ACTIVE` ou `RESOLVED` |
| `createdAt` | `LocalDateTime` | Date de déclenchement |
| `resolvedAt` | `LocalDateTime` | Date de résolution |

#### Niveaux de sévérité (`AlertSeverity`)

| Sévérité | Condition |
|----------|-----------|
| `CRITICAL` | Stock = 0 (rupture totale) |
| `HIGH` | Stock <= 25% du seuil |
| `MEDIUM` | Stock <= 50% du seuil |
| `LOW` | Stock <= seuil mais > 50% |

#### Endpoints REST

| Méthode | URL | Rôle requis | Description |
|---------|-----|-------------|-------------|
| `GET` | `/api/stock-alerts` | Tous | Toutes les alertes |
| `GET` | `/api/stock-alerts/active` | Tous | Alertes actives uniquement |

---

## 4. Flux P2P Complet (Procure-to-Pay)

Le flux P2P représente le parcours **complet** d'un besoin interne jusqu'à la mise en stock.

```
  1. Identification du Besoin
       Le magasinier constate un stock bas
           |
           v
  2. Création DA (Brouillon)
       USER crée une Purchase Requisition
           |
           v
  3. Soumission de la DA
       USER soumet pour approbation
           |
           v
  4. Approbation ?
       MANAGER examine la demande
          / \
         /   \
    Approuvée  Rejetée
       |          |
       v          v
  5. Création PO    Fin (avec motif)
       MANAGER crée la commande
           |
           v
  6. Émission du PO
       MANAGER émet au fournisseur
           |
           v
  7. Réception Marchandise
       USER/MANAGER enregistre la GR
           |
           v
  8. Mise à jour Stock
       Automatique + mouvement de stock
           |
           v
  9. Alerte résolue
       Si stock > seuil → résolution auto
```

### Détail étape par étape

| # | Étape | Acteur | Module | Statut résultant |
|---|-------|--------|--------|-----------------|
| 1 | Constat de stock bas | USER | Dashboard / Alertes | — |
| 2 | Création DA brouillon | USER | Purchase Requisition | `DRAFT` |
| 3 | Soumission de la DA | USER | Purchase Requisition | `SUBMITTED` |
| 4 | Examen de la DA | MANAGER | Purchase Requisition | `APPROVED` ou `REJECTED` |
| 5 | Création du PO | MANAGER | Purchase Order | `DRAFT` (DA → `ORDERED`) |
| 6 | Émission du PO | MANAGER | Purchase Order | `ISSUED` |
| 7 | Réception des articles | USER/MANAGER | Goods Receipt | PO → `PARTIALLY_RECEIVED` ou `COMPLETED` |
| 8 | Mise à jour inventaire | Système | Inventory + StockMovement | Stock augmente |
| 9 | Résolution d'alerte | Système | Stock Alerts | `RESOLVED` (si applicable) |

---

## 5. Gestion des Rôles & Permissions (RBAC)

### 5.1 Matrice complète des permissions

| Fonctionnalité | ADMIN | MANAGER | USER |
|---------------|-------|---------|------|
| **Dashboard** | Oui | Oui | Oui |
| — Voir les statistiques | Oui | Oui | Oui |
| **Fournisseurs** | | | |
| — Lister / Voir | Oui | Oui | Non (page masquée) |
| — Créer / Modifier | Oui | Oui | Non |
| — Supprimer | Oui | Non | Non |
| **Catalogue Articles** | | | |
| — Lister / Voir | Oui | Oui | Oui |
| — Créer / Modifier / Supprimer | Oui | Non | Non |
| **Entrepôts** | | | |
| — Lister | Oui | Oui | Oui |
| — Créer | Oui | Non | Non |
| **Inventaire** | | | |
| — Consulter les stocks | Oui | Oui | Oui |
| — Créer une ligne d'inventaire | Oui | Oui | Non |
| — Augmenter / Réserver le stock | Oui | Oui | Non |
| — Consommer du stock | Oui | Oui | Oui |
| — Déclarer un rebut (Scrap) | Oui | Oui | Oui |
| **Fiche Info Achat (PIR)** | | | |
| — Consulter | Oui | Oui | Oui |
| — Créer / Modifier | Oui | Oui | Non |
| **Demande d'Achat (DA)** | | | |
| — Lister / Voir | Oui | Oui | Oui |
| — Créer (brouillon) | Oui | Oui | Oui |
| — Soumettre | Oui | Oui | Oui |
| — Approuver / Rejeter | Oui | Oui | Non |
| **Commande Fournisseur (PO)** | | | |
| — Lister / Voir | Oui | Oui | Non (page masquée) |
| — Créer / Émettre / Annuler | Oui | Oui | Non |
| **Réception Marchandise (GR)** | | | |
| — Lister | Oui | Oui | Oui |
| — Créer une réception | Oui | Oui | Oui |
| **Alertes de Stock** | Oui | Oui | Oui |
| **Historique Mouvements** | Oui | Oui | Oui |

### 5.2 Description détaillée de chaque rôle

#### ADMIN — Administrateur Système

> Le super-utilisateur avec un accès total à toutes les fonctionnalités.

**Responsabilités :**
- Configuration du système (entrepôts, utilisateurs)
- Gestion complète du référentiel produits (CRUD)
- Supervision de l'ensemble du flux P2P
- Suppression de données sensibles (fournisseurs)
- Accès à toutes les fonctions MANAGER et USER

**Accès navigation :**
- Tableau de Bord
- Fournisseurs
- Catalogue Articles
- Stock & Magasin
- Demandes d'Achat
- Commandes Fournisseurs
- Réceptions Marchandises
- Alertes de Stock
- Historique Mouvements

---

#### MANAGER — Acheteur / Responsable Achats

> Le responsable du processus d'achat et d'approvisionnement.

**Responsabilités :**
- Gestion des fournisseurs (création, modification)
- Approbation ou rejet des demandes d'achat
- Création et émission des commandes fournisseurs
- Configuration des fiches info achat (PIR)
- Gestion des niveaux de stock (réservation, augmentation)
- Suivi des réceptions et des livraisons

**Accès navigation :**
- Tableau de Bord
- Fournisseurs
- Catalogue Articles (lecture seule)
- Stock & Magasin
- Demandes d'Achat (+ approbation)
- Commandes Fournisseurs
- Réceptions Marchandises
- Alertes de Stock
- Historique Mouvements

---

#### USER — Magasinier / Warehouse Clerk

> L'opérateur terrain responsable du stock physique.

**Responsabilités :**
- Création des demandes d'achat pour les besoins constatés
- Réception physique des marchandises (Goods Receipt)
- Consommation de stock (sorties internes)
- Déclaration de rebut (pièces cassées / défectueuses)
- Consultation des alertes et de l'historique

**Accès navigation :**
- Tableau de Bord
- Catalogue Articles (lecture seule)
- Stock & Magasin
- Demandes d'Achat (création, soumission)
- Réceptions Marchandises
- Alertes de Stock
- Historique Mouvements

**Restrictions :**
- Ne voit PAS le menu "Fournisseurs"
- Ne voit PAS le menu "Commandes Fournisseurs"
- Ne peut PAS approuver/rejeter une DA
- Ne peut PAS créer/modifier les articles
- Ne peut PAS créer les entrepôts

---

## 6. Règles Métier & Validations

### 6.1 Règles métier implémentées

| Module | Règle | Implémentation |
|--------|-------|----------------|
| **Product** | Nom min. 2 caractères | `Product.java` constructeur |
| **Product** | SKU obligatoire et unique | `Product.java` + contrôle DB |
| **Product** | Prix > 0 | `Price` Value Object |
| **Supplier** | Nom min. 2 caractères | `Supplier.java` constructeur |
| **Supplier** | ContactInfo (email + phone) obligatoire | `Supplier.java` constructeur |
| **Inventory** | Statut auto-calculé (IN_STOCK / LOW_STOCK / OUT_OF_STOCK) | `Inventory.calculateStatus()` |
| **Inventory** | Stock ne peut pas devenir négatif | `Inventory.consume()` / `Inventory.scrap()` |
| **DA** | Quantité > 0 | `PurchaseRequisition.java` constructeur |
| **DA** | Machine d'états stricte (DRAFT→SUBMITTED→APPROVED→ORDERED) | `PurchaseRequisition.submit()`, etc. |
| **DA** | Quantité modifiable uniquement en DRAFT | `PurchaseRequisition.updateQuantity()` |
| **PO** | Au moins 1 article par commande | `PurchaseOrder.java` constructeur |
| **PO** | Prix unitaire > 0 par ligne | `PurchaseOrderItem.java` constructeur |
| **PO** | Quantité commandée > 0 par ligne | `PurchaseOrderItem.java` constructeur |
| **PO** | Total calculé automatiquement | `PurchaseOrder.calculateTotal()` |
| **PO** | Réception partielle supportée | `PurchaseOrder.recordReceipt()` |
| **PO** | Interdiction de recevoir plus que commandé | `PurchaseOrderItem.recordReceipt()` |
| **PO** | Annulation impossible si réception déjà effectuée | `PurchaseOrder.cancel()` |
| **GR** | BL (Bon de Livraison) obligatoire | `GoodsReceipt.java` constructeur |
| **GR** | Au moins 1 article par réception | `GoodsReceipt.java` constructeur |
| **PIR** | Prix de base > 0 | `PurchasingInfoRecord.java` constructeur |
| **PIR** | Lead time min. 1 jour | `PurchasingInfoRecord.java` constructeur |
| **PIR** | MOQ min. 1 | `PurchasingInfoRecord.java` constructeur |
| **PIR** | Calcul de remise dégressive | `PurchasingInfoRecord.calculateEffectiveUnitPrice()` |
| **StockMovement** | Immuable (journal d'audit) | Pas de setter / update |
| **StockMovement** | Quantité > 0 | `StockMovement.java` constructeur |
| **StockAlert** | Sévérité auto-calculée | `StockAlert.calculateSeverity()` |
| **RBAC** | Séparation des tâches (SoD) | `@PreAuthorize` + routes frontend |
| **Auth** | JWT avec refresh token | Spring Security + jjwt |

### 6.2 Gestion des erreurs centralisée

Le `GlobalExceptionHandler` capture toutes les exceptions et retourne des réponses HTTP structurées :

| Code HTTP | Exception | Cas d'usage |
|-----------|-----------|-------------|
| `400` | `IllegalArgumentException`, `IllegalStateException` | Violation de règle métier |
| `400` | `MethodArgumentNotValidException` | Validation de formulaire |
| `400` | `HttpMessageNotReadableException` | Corps JSON invalide |
| `401` | `BadCredentialsException` | Identifiants incorrects |
| `403` | `AccessDeniedException` | Rôle insuffisant |
| `404` | `SupplierNotFoundException`, `NoSuchElementException` | Ressource introuvable |
| `409` | `DataIntegrityViolationException` | Conflit d'intégrité (FK) |
| `500` | `Exception` | Erreur inattendue |

---

## 7. API REST — Référence Complète

### Base URL : `http://localhost:8080/api`

### Authentication

```
POST /api/auth/register    ← Inscription
POST /api/auth/login       ← Connexion (retourne JWT)
POST /api/auth/refresh     ← Rafraîchir le token
```

### Données de référence (Master Data)

```
# Fournisseurs
GET    /api/suppliers
GET    /api/suppliers/{id}
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}

# Articles
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

# Entrepôts
GET    /api/warehouses
POST   /api/warehouses
```

### Fiche Info Achat (PIR)

```
GET    /api/purchasing-info-records
GET    /api/purchasing-info-records/product/{productId}
POST   /api/purchasing-info-records
PUT    /api/purchasing-info-records/{id}
```

### Flux P2P

```
# Demandes d'Achat
GET    /api/purchase-requisitions
GET    /api/purchase-requisitions/{id}
POST   /api/purchase-requisitions
PUT    /api/purchase-requisitions/{id}
POST   /api/purchase-requisitions/{id}/submit
POST   /api/purchase-requisitions/{id}/approve
POST   /api/purchase-requisitions/{id}/reject

# Commandes Fournisseurs
GET    /api/purchase-orders
GET    /api/purchase-orders/{id}
POST   /api/purchase-orders
POST   /api/purchase-orders/{id}/issue
POST   /api/purchase-orders/{id}/cancel

# Réceptions
GET    /api/goods-receipts
POST   /api/goods-receipts
```

### Stock & Audit

```
# Inventaire
GET    /api/inventories
GET    /api/inventories/{id}
GET    /api/inventories/product/{pid}/warehouse/{wid}
POST   /api/inventories
POST   /api/inventories/{id}/consume
POST   /api/inventories/{id}/reserve
POST   /api/inventories/{id}/increase
POST   /api/inventories/{id}/scrap

# Mouvements de Stock
GET    /api/stock-movements

# Alertes
GET    /api/stock-alerts
GET    /api/stock-alerts/active
```

---

## 8. Données de Test (Seed Data)

Le `DataSeeder` (activé via `app.seed.enabled=true`) pré-charge les données suivantes :

### 8.1 Utilisateurs

| Email | Mot de passe | Rôle | Persona |
|-------|-------------|------|---------|
| `admin@stockpilot.com` | `Admin@1234` | ADMIN | Administrateur système |
| `manager@stockpilot.com` | `Manager@1234` | MANAGER | Responsable achats |
| `user@stockpilot.com` | `User@1234` | USER | Magasinier |

### 8.2 Entrepôt

| Nom | Adresse | Ville |
|-----|---------|-------|
| Entrepôt Central Lyon | 12 Rue des Industries | Lyon, France, 69007 |

### 8.3 Fournisseurs

| Nom | Email | Téléphone | N Fiscal | Paiement |
|-----|-------|-----------|----------|----------|
| Acme Industrial Supplies | contact@acme-ind.com | +33 4 78 00 11 22 | FR12345678901 | NET_30 |
| ElectroTech Solutions | sales@electrotech.fr | +33 1 45 67 89 00 | FR98765432109 | NET_45 |
| Global Parts Logistics | orders@globalparts.com | +33 2 40 12 34 56 | FR45678901234 | NET_30 |

### 8.4 Articles (Material Master)

| Article | SKU | Prix Catalogue | UoM | Catégorie |
|---------|-----|---------------|-----|-----------|
| Moteur Électrique Triphasé 5kW | MOT-TRI-5KW | 450,00 EUR | PCS | RAW_MATERIAL |
| Roulement à Billes SKF 6204 | ROU-SKF-6204 | 25,00 EUR | PCS | RAW_MATERIAL |
| Câble Cuivre Industriel 4mm2 | CAB-CUV-4MM | 8,50 EUR | M | RAW_MATERIAL |

### 8.5 Fiches Info Achat (PIR)

| Article | Fournisseur | Ref Fournisseur | Prix base | Lead Time | MOQ | Seuil remise | Remise | Préféré |
|---------|-------------|-----------------|-----------|-----------|-----|-------------|--------|---------|
| Moteur 5kW | Acme | ACM-MTR-50 | 420 EUR | 3j | 2 | >= 10 pcs | -8% | Oui |
| Moteur 5kW | Global Parts | GPL-MOT-05 | 440 EUR | 7j | 1 | >= 20 pcs | -12% | Non |
| Roulement SKF | Acme | ACM-SKF-6204 | 22 EUR | 2j | 10 | >= 50 pcs | -10% | Oui |
| Roulement SKF | ElectroTech | ETS-RLM-6204 | 24,50 EUR | 5j | 5 | >= 100 pcs | -15% | Non |
| Câble Cuivre 4mm2 | ElectroTech | ETS-CAB-004 | 7,80 EUR | 4j | 50 | >= 200 m | -12% | Oui |

---

## 9. Scénarios de Test End-to-End

### Scénario 0 — Grand Parcours Guidé E2E (Création de Zéro : Fournisseur → Article → PIR → DA → PO → GR → Stock)

**Objectif** : Valider l'intégralité du cycle de vie de données et du flux P2P en partant d'une base vierge avec changement de rôles et vérification des permissions.

#### Étape 1 : Connexion ADMIN (`admin@stockpilot.com` / `Admin@1234`)
*Rôle : Administrateur Système & Référentiel Master Data*

1. **Création du Fournisseur Habilité** :
   - Naviguer vers **Fournisseurs** (`/suppliers`) via le menu latéral
   - Cliquer sur le bouton `+ Nouveau Fournisseur`
   - Saisir :
     - Raison sociale : `Valves & Tuyauteries Méditerranée`
     - Email : `contact@valves-med.fr`
     - N° TVA : `FR55998877661`
     - Conditions de règlement : `30 Jours (NET_30)`
     - Devise : `EUR`
   - Valider : Le fournisseur apparaît instantanément dans la liste avec badge 30 Jours.

2. **Création du Nouvel Article au Catalogue** :
   - Naviguer vers **Catalogue Articles** (`/products`)
   - Cliquer sur `+ Nouvel Article` (visible uniquement par ADMIN)
   - Saisir :
     - Désignation : `Vanne Inox Haute Pression 50mm`
     - SKU : `VAN-INOX-50` (ou généré automatiquement)
     - Catégorie : `RAW_MATERIAL` (Intrants & Matières Premières)
     - Prix Unitaire indicatif : `85.00 EUR`
     - Unité de mesure : `PCS`
   - Valider : L'article est enregistré dans le référentiel d'entreprise.

3. **Association Article ↔ Fournisseur via Fiche Info Achat (PIR)** :
   - Naviguer vers **Fiches Info Achat (PIR)** (`/purchasing-info-records`)
   - Cliquer sur `+ Nouvelle Fiche PIR`
   - Renseigner les conditions négociées :
     - Article : `Vanne Inox Haute Pression 50mm`
     - Fournisseur : `Valves & Tuyauteries Méditerranée`
     - Réf. Fournisseur : `VAL-HP-50-SS`
     - Prix de base négocié HT : `75.00 EUR`
     - Délai moyen de livraison (Lead Time) : `4 jours`
     - Quantité minimale (MOQ) : `5 PCS`
     - Barème dégressif : Palier `20 PCS` → Remise `-10%`
     - Cocher : `Fournisseur préférentiel par défaut`
   - Valider : La fiche PIR est créée avec statut préférentiel et barème actif.

4. **Déconnexion** : Cliquer sur le profil utilisateur en haut à droite puis "Se déconnecter".

---

#### Étape 2 : Connexion USER / Magasinier (`user@stockpilot.com` / `User@1234`)
*Rôle : Opérateur Magasin & Gestionnaire Flux Physiques*

1. **Vérification de l'Espace Rôle (Aucune fausse permission)** :
   - Le tableau de bord affiche le bandeau vert *Espace Magasin & Opérations Stock*
   - Aucun bouton `+ Nouvel Article` ni `+ Fournisseur` n'est visible (évite toute erreur 403 Forbidden)
   - Les menus *Fournisseurs*, *Commandes* et *Fiches PIR* sont masqués du menu latéral

2. **Expression d'un Besoin de Réapprovisionnement (DA)** :
   - Naviguer vers **Demandes d'Achat** (`/requisitions`)
   - Cliquer sur `+ Nouvelle Demande`
   - Saisir :
     - Article : `Vanne Inox Haute Pression 50mm`
     - Quantité demandée : `25 PCS` *(note : dépasse le seuil de 20 PCS pour bénéficier de la remise !)*
     - Entrepôt : `Entrepôt Central Lyon`
     - Motif : `Maintenance préventive circuit haute pression`
   - Valider : La DA est créée en statut `DRAFT` (Brouillon).

3. **Soumission de la Demande** :
   - Sur la ligne de la DA, cliquer sur l'icône violette **Soumettre** (icône avion papier)
   - Statut : La DA passe immédiatement à `SUBMITTED`
   - Constat : Le magasinier ne voit **pas** de bouton d'approbation (SoD respecté).

4. **Déconnexion**.

---

#### Étape 3 : Connexion MANAGER / Achats (`manager@stockpilot.com` / `Manager@1234`)
*Rôle : Responsable Achats & Approvisionnements*

1. **Supervision Achat & Approbation DA** :
   - Le Dashboard Achats affiche un badge d'alerte : `1 Demande(s) DA à valider`
   - Naviguer vers **Demandes d'Achat** (`/requisitions`)
   - Sur la DA soumise, le bouton vert **Approuver** (icône Check) est disponible
   - Cliquer sur **Approuver** : Statut passe à `APPROVED`.

2. **Génération du Bon de Commande Fournisseur (PO) avec Tarif PIR Automatique** :
   - Sur la DA approuvée, cliquer sur l'icône bleue **Commander** (icône Caddie)
   - La modal d'émission de commande s'ouvre :
     - Le fournisseur `Valves & Tuyauteries Méditerranée` est pré-sélectionné (PIR préférentiel)
     - Le système calcule automatiquement le tarif dégressif PIR :
       - Prix unitaire de base : `75,00 EUR`
       - Remise appliquée : `-10%` car quantité `25 >= 20 PCS`
       - Prix négocié effectif : **`67,50 EUR` / PCS**
       - Total commande calculé : **`1 687,50 EUR`**
   - Cliquer sur `Générer le Bon de Commande`.

3. **Émission de la Commande vers le Fournisseur** :
   - Naviguer vers **Commandes Fournisseurs** (`/orders`)
   - La commande apparaît en statut `DRAFT`
   - Cliquer sur `Émettre la commande` : Le statut passe à `ISSUED` (en cours de livraison)
   - La Demande d'Achat passe automatiquement à l'état `ORDERED`.

4. **Déconnexion**.

---

#### Étape 4 : Connexion USER / Magasinier (`user@stockpilot.com` / `User@1234`)
*Rôle : Réception Physique & Mise en Stock*

1. **Réception de Marchandises (Goods Receipt - SAP MIGO)** :
   - Naviguer vers **Réceptions Marchandises** (`/goods-receipt`)
   - Cliquer sur `Nouvelle Réception`
   - Sélectionner le Bon de Commande émis pour `Valves & Tuyauteries Méditerranée`
   - Numéro de Bon de Livraison (BL) : `BL-VALVES-2026-001`
   - Quantité reçue : `25 PCS`
   - Valider la réception :
     - La réception est enregistrée
     - Le PO passe au statut final `COMPLETED`.

2. **Contrôle du Stock Physique** :
   - Naviguer vers **Inventaire & Stocks** (`/inventory`)
   - L'article `Vanne Inox Haute Pression 50mm` affiche bien **25 PCS** en Stock Disponible dans l'Entrepôt Central Lyon avec statut `IN_STOCK` !

3. **Contrôle de Traçabilité & Mouvements** :
   - Naviguer vers **Historique Mouvements** (`/movements`)
   - Une nouvelle ligne d'audit apparaît :
     - Type : `GOODS_RECEIPT_PO` (+25 PCS)
     - Référence : `BL-VALVES-2026-001`
     - Horodatage certifié.

4. **Test de Déclaration de Casse / Rebut (SAP MM Mouvement 551)** :
   - Retourner dans **Inventaire & Stocks** (`/inventory`)
   - Sur la ligne de la vanne, cliquer sur l'icône flamme rouge `Déclarer une casse`
   - Quantité au rebut : `2 PCS`
   - Motif : `Joint torique endommagé au déballage`
   - Valider :
     - Le stock disponible passe à **23 PCS**
     - Un mouvement d'audit `SCRAP_DAMAGED` de **-2 PCS** est tracé dans l'historique !

---

### Scénario 1 — Flux P2P Complet (Moteur Triphasé)

**Objectif** : Tester le parcours complet d'un besoin à la mise en stock avec les données pré-seedées.

| Étape | Connecté en tant que | Action | Résultat attendu |
|-------|---------------------|--------|------------------|
| 1 | ADMIN | Vérifier Dashboard - articles et fournisseurs seedés | Données visibles |
| 2 | ADMIN | Créer un inventaire : Moteur 5kW → Entrepôt Lyon, qté=5, seuil=10 | Inventaire créé, statut `LOW_STOCK` |
| 3 | USER | Se connecter avec `user@stockpilot.com` | Dashboard visible, pas de menu Fournisseurs |
| 4 | USER | Demandes d'Achat → Créer DA : Moteur 5kW, qté=15, justif="Stock bas" | DA créée en `DRAFT` |
| 5 | USER | Cliquer "Soumettre" sur la DA | DA passe en `SUBMITTED` |
| 6 | MANAGER | Se connecter avec `manager@stockpilot.com` | Menu Commandes Fournisseurs visible |
| 7 | MANAGER | Demandes d'Achat → Approuver la DA soumise | DA passe en `APPROVED` |
| 8 | MANAGER | Commandes → Créer PO depuis la DA approuvée | Formulaire pré-rempli avec PIR Acme (420 EUR, -8% pour 15 pcs = **386,40 EUR/pcs**) |
| 9 | MANAGER | Valider le PO puis cliquer "Émettre" | PO passe `DRAFT → ISSUED`, DA → `ORDERED` |
| 10 | USER | Réceptions → Créer GR : PO sélectionné, BL="BL-12345", 15 moteurs | GR créé, PO → `COMPLETED`, Stock +15 |
| 11 | Tous | Vérifier Inventaire → Moteur 5kW | qté = 20 (5+15), statut `IN_STOCK` |
| 12 | Tous | Historique Mouvements → dernière entrée | Type `GOODS_RECEIPT_PO`, qté=15 |

---

### Scénario 2 — Réception Partielle (Roulement SKF)

| Étape | Connecté en tant que | Action | Résultat attendu |
|-------|---------------------|--------|------------------|
| 1 | ADMIN | Créer inventaire : Roulement SKF → Lyon, qté=0, seuil=20 | `OUT_OF_STOCK`, alerte `CRITICAL` générée |
| 2 | USER | Créer DA : Roulement SKF, qté=60, soumettre | DA en `SUBMITTED` |
| 3 | MANAGER | Approuver la DA | DA en `APPROVED` |
| 4 | MANAGER | Créer PO vers Acme : 60 pcs x 22 EUR (PIR préféré, < seuil 50 donc pas de remise) | Total = 1 320 EUR |
| 5 | MANAGER | Émettre le PO | PO `ISSUED` |
| 6 | USER | GR #1 : réception de 30 roulements, BL="BL-R001" | PO → `PARTIALLY_RECEIVED`, Stock = 30 |
| 7 | USER | GR #2 : réception de 30 roulements, BL="BL-R002" | PO → `COMPLETED`, Stock = 60 |
| 8 | Tous | Vérifier alertes | Alerte `RESOLVED` automatiquement |

---

### Scénario 3 — Rejet d'une DA et Mise au rebut

| Étape | Connecté en tant que | Action | Résultat attendu |
|-------|---------------------|--------|------------------|
| 1 | USER | Créer DA : Câble Cuivre, qté=10, soumettre | DA en `SUBMITTED` |
| 2 | MANAGER | Rejeter la DA avec motif "Quantité insuffisante, minimum 50m" | DA → `REJECTED` |
| 3 | USER | Voir le motif de rejet dans la liste des DA | Motif affiché |
| 4 | ADMIN | Créer inventaire : Câble Cuivre → Lyon, qté=100, seuil=50 | `IN_STOCK` |
| 5 | USER | Inventaire → Déclarer rebut : 10m de câble, motif="Câble endommagé" | Stock → 90, mouvement `SCRAP_DAMAGED` créé |
| 6 | Tous | Historique mouvements | Entrée `SCRAP_DAMAGED`, qté=10 |

---

### Scénario 4 — Test des permissions (Contrôle d'accès)

| Test | Connecté en tant que | Action | Résultat attendu |
|------|---------------------|--------|------------------|
| 1 | USER | Accéder à `/suppliers` | Redirigé vers Forbidden ou page non listée |
| 2 | USER | Accéder à `/orders` | Redirigé vers Forbidden ou page non listée |
| 3 | USER | Tenter d'approuver une DA via API | HTTP 403 Forbidden |
| 4 | USER | Tenter de créer un article via API | HTTP 403 Forbidden |
| 5 | MANAGER | Tenter de supprimer un fournisseur | HTTP 403 Forbidden |
| 6 | MANAGER | Tenter de créer un article | HTTP 403 Forbidden |
| 7 | ADMIN | Toutes les actions ci-dessus | Toutes autorisées (HTTP 200/201) |

---

## 10. Structure des Fichiers du Projet

```
StockPilot/
├── backend/
│   ├── pom.xml                           ← Dépendances Maven
│   └── src/main/java/com/exmple/stockpilot/
│       ├── StockPilotApplication.java    ← Point d'entrée Spring Boot
│       ├── auth/                         ← Module Authentification
│       │   ├── domain/                   (User, Role)
│       │   ├── application/              (AuthService)
│       │   ├── infrastructure/           (UserJpaEntity, JwtService, DataSeeder)
│       │   └── presentation/             (AuthController)
│       ├── common/                       ← Utilitaires transversaux
│       │   └── exception/               (GlobalExceptionHandler, ErrorResponse)
│       ├── supplier/                     ← Module Fournisseur
│       │   ├── domain/                   (Supplier, SupplierId, ContactInfo, SupplierStatus)
│       │   ├── application/              (SupplierService)
│       │   ├── infrastructure/           (SupplierJpaEntity, PersistenceAdapter)
│       │   └── presentation/             (SupplierController)
│       ├── product/                      ← Module Article
│       │   ├── domain/                   (Product, ProductId, SKU, Price, UoM, ProductCategory)
│       │   ├── application/              (ProductService)
│       │   ├── infrastructure/           (ProductJpaEntity, PersistenceAdapter)
│       │   └── presentation/             (ProductController)
│       ├── Warehouse/                    ← Module Entrepôt
│       │   ├── domain/                   (Warehouse, WarehouseId, Location, WarehouseStatus)
│       │   ├── application/              (WarehouseService)
│       │   ├── infrastructure/           (WarehouseJpaEntity, PersistenceAdapter)
│       │   └── presentation/             (WarehouseController)
│       ├── Inventory/                    ← Module Inventaire
│       │   ├── domain/                   (Inventory, InventoryId, InventoryStatus)
│       │   ├── application/              (InventoryService, Use Cases)
│       │   ├── infrastructure/           (InventoryJpaEntity, PersistenceAdapter)
│       │   └── presentation/             (InventoryController)
│       ├── purchasinginforecord/         ← Module Fiche Info Achat (PIR)
│       │   ├── domain/                   (PurchasingInfoRecord)
│       │   ├── infrastructure/           (PIR JpaEntity, Repository)
│       │   └── presentation/             (PIR Controller)
│       ├── purchaserequisition/          ← Module Demande d'Achat
│       │   ├── domain/                   (PurchaseRequisition, PurchaseRequisitionStatus)
│       │   ├── application/              (PurchaseRequisitionService)
│       │   ├── infrastructure/           (PR JpaEntity, PersistenceAdapter)
│       │   └── presentation/             (PurchaseRequisitionController)
│       ├── purchaseorder/                ← Module Bon de Commande
│       │   ├── domain/                   (PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus)
│       │   ├── application/              (PurchaseOrderService)
│       │   ├── infrastructure/           (PO JpaEntity, PersistenceAdapter)
│       │   └── presentation/             (PurchaseOrderController)
│       ├── goodsreceipt/                 ← Module Réception Marchandise
│       │   ├── domain/                   (GoodsReceipt, GoodsReceiptItem)
│       │   ├── application/              (GoodsReceiptService)
│       │   ├── infrastructure/           (GR JpaEntity, PersistenceAdapter)
│       │   └── presentation/             (GoodsReceiptController)
│       ├── stockmovement/                ← Module Mouvements de Stock
│       │   ├── domain/                   (StockMovement, MovementType)
│       │   ├── application/              (StockMovementService)
│       │   ├── infrastructure/           (Movement JpaEntity, PersistenceAdapter)
│       │   └── presentation/             (StockMovementController)
│       └── stockalert/                   ← Module Alertes de Stock
│           ├── domain/                   (StockAlert, AlertSeverity, AlertStatus)
│           ├── application/              (StockAlertService)
│           ├── infrastructure/           (Alert JpaEntity, PersistenceAdapter)
│           └── presentation/             (StockAlertController)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                       ← Routing principal
│       ├── context/                      (AuthContext, SidebarContext)
│       ├── hooks/                        (useAuth)
│       ├── components/
│       │   ├── auth/                     (ProtectedRoute)
│       │   ├── common/                   (ScrollToTop, StockPilotLogo)
│       │   └── ui/                       (Badge, Button, Modal...)
│       ├── features/
│       │   ├── auth/                     (authApi, types)
│       │   ├── suppliers/                (suppliersApi, CreateSupplierModal)
│       │   ├── products/                 (productsApi, CreateProductModal)
│       │   ├── inventory/                (inventoryApi)
│       │   ├── procurement/              (procurementApi, pirApi, CreateRequisitionModal, CreateOrderModal, CreatePirModal)
│       │   ├── goods-receipt/            (goodsReceiptApi)
│       │   ├── movements/                (movementsApi)
│       │   └── alerts/                   (alertsApi)
│       ├── layout/                       (AppLayout, AppSidebar, AppHeader)
│       ├── pages/
│       │   ├── Auth/                     (LoginPage, SignUpPage)
│       │   ├── Dashboard/                (DashboardPage, AdminDashboard, ManagerDashboard, UserDashboard, components/)
│       │   ├── Suppliers/                (SuppliersPage)
│       │   ├── Products/                 (ProductsPage)
│       │   ├── Inventory/                (InventoryPage)
│       │   ├── Procurement/              (RequisitionsPage, OrdersPage, PurchasingInfoRecordPage)
│       │   ├── GoodsReceipt/             (GoodsReceiptPage)
│       │   ├── Movements/                (MovementsPage)
│       │   ├── Alerts/                   (AlertsPage)
│       │   └── OtherPage/               (NotFound, Forbidden)
│       └── shared/                       (ToastContext)
│
└── docs/
    └── STOCKPILOT_PROJECT_DOCUMENTATION.md  ← Ce document
```

---

## Glossaire

| Terme | Abréviation | Signification |
|-------|-------------|---------------|
| **P2P** | Procure-to-Pay | Cycle achat complet du besoin au paiement |
| **DA** | Demande d'Achat | Purchase Requisition (PR) |
| **PO** | Purchase Order | Bon de Commande Fournisseur |
| **GR** | Goods Receipt | Réception de Marchandises |
| **PIR** | Purchasing Info Record | Fiche Info Achat (lien Article - Fournisseur) |
| **BL** | Bon de Livraison | Document fourni par le transporteur |
| **SKU** | Stock Keeping Unit | Référence unique d'un article |
| **MOQ** | Minimum Order Quantity | Quantité minimum de commande |
| **SoD** | Separation of Duties | Séparation des tâches (contrôle interne) |
| **RBAC** | Role-Based Access Control | Contrôle d'accès basé sur les rôles |
| **DDD** | Domain-Driven Design | Architecture orientée domaine |
| **JWT** | JSON Web Token | Standard d'authentification |
| **UoM** | Unit of Measure | Unité de mesure (PCS, M, KG...) |

---

> Ce document est la source unique de vérité pour comprendre StockPilot.
> Il couvre l'architecture, tous les modules, les règles métier, les permissions et les scénarios de test complets.
