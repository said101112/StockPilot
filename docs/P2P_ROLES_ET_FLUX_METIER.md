# 📘 Guide du Flux P2P (Procure-to-Pay) & Matrice des Rôles dans StockPilot MM

Ce document décrit en détail l'organisation du cycle **Procure-to-Pay (P2P)** dans le module **Material Management (MM)** de StockPilot, les habilitations de chaque rôle utilisateur, le cycle de vie des documents, l'association Fournisseurs-Articles (**Fiches Info Achat / PIR**) avec tarifs dégressifs et délais, ainsi qu'un **guide pas-à-pas pour tester tout le flux avec les différents rôles**.

---

## 1. 👥 Matrice des Rôles : Qui Fait Quoi ?

L'application gère 3 rôles principaux avec une stricte séparation des tâches (*Segregation of Duties*) :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MATRICE DES RÔLES                                │
├─────────────────────┬───────────────────┬───────────────────────────────────┤
│ Rôle Technique      │ Rôle Métier       │ Responsabilités Clés              │
├─────────────────────┼───────────────────┼───────────────────────────────────┤
│ USER                │ Magasinier        │ - Saisie & soumission des DA      │
│                     │ / Demandeur       │ - Réception physique (BL / MIGO)  │
│                     │                   │ - Consultation stock & alertes    │
│                     │                   │ - Déclaration de rebuts (Scrap)   │
├─────────────────────┼───────────────────┼───────────────────────────────────┤
│ MANAGER             │ Acheteur          │ - Approbation / Rejet des DA      │
│                     │ / Resp. Appro     │ - Négociation & choix fournisseur │
│                     │                   │ - Émission des Bons de Commande   │
│                     │                   │ - Gestion Fournisseurs & PIR      │
├─────────────────────┼───────────────────┼───────────────────────────────────┤
│ ADMIN               │ Administrateur    │ - Référentiel Articles (Articles) │
│                     │ Référentiel & IT  │ - Paramétrage Entrepôts           │
│                     │                   │ - Tous les droits de gestion      │
└─────────────────────┴───────────────────┴───────────────────────────────────┘
```

---

## 2. 🔄 Le Flux P2P Complet Pas à Pas (De 0 à la Réception)

```
 [1. Fournisseur]     [2. Article]
        │                  │
        ▼                  ▼
 [3. Fiche Info Achat / Association Fournisseur-Article (PIR)]
   • Réf. Fournisseur  • Prix négocié  • Lead Time (Jours)  • Remise Volume %
                           │
                           ▼
 [4. Expression du Besoin : Demande d'Achat (DA)] (Magasinier - USER)
        │
        ▼ (Validation Acheteur)
 [5. Approbation de la DA] (Acheteur - MANAGER)
        │
        ▼ (Transformation en Commande via PIR)
 [6. Bon de Commande Fournisseur (PO)] (Acheteur - MANAGER)
   • Fournisseur qualifié pré-sélectionné
   • Remise volume dégressive appliquée automatiquement
   • Date de livraison calculée selon le Lead Time
        │
        ▼ (Livraison transporteur)
 [7. Réception Marchandise (GR / MIGO)] (Magasinier - USER)
        │
        ├─────────────────────────────┐
        ▼                             ▼
 [8. Entrée en Stock]      [9. Mouvement Tracé (101)]
```

---

## 3. 🏷️ L'Association Fournisseur-Article (Fiche Info Achat - PIR)

Le système intègre désormais le concept SAP MM **Purchasing Info Record (PIR)** :
- **Identification** : Relie de manière unique un Article (`productId`) à un Fournisseur habilité (`supplierId`).
- **Référence Fournisseur** : Code de la pièce dans le catalogue du fournisseur (`supplierPartNumber`).
- **Prix Négocié de Base** : Prix unitaire négocié par contrat (`baseUnitPrice`).
- **Délai de Livraison Standard (*Lead Time*)** : Nombre moyen de jours ouvrés nécessaires à l'acheminement (`leadTimeDays`). Le système calcule automatiquement la date prévue d'arrivée : $\text{Date commande} + \text{Lead Time}$.
- **Paliers Dégressifs (*Volume Discounts*)** : Si la quantité commandée atteint ou dépasse le palier (`discountTierQuantity`), le système applique immédiatement la remise en pourcentage (`discountPercentage`).
- **Fournisseur Préféré (*Preferred Supplier*)** : Badge ⭐ qui pré-sélectionne le partenaire prioritaire lors de la génération de commande.

---

## 4. 🧪 Guide de Test Pas à Pas (Jeu d'Essai Multi-Rôles)

Pour tester de bout en bout l'ensemble du flux sans rien avoir à saisir au préalable, des données de démonstration sont pré-chargées automatiquement au démarrage :

### 🔑 Identifiants des Rôles

| Rôle | Email de Connexion | Mot de Passe | Rôle Métier |
| :--- | :--- | :--- | :--- |
| **USER** | `user@stockpilot.com` | `User@1234` | **Magasinier / Réceptionnaire** |
| **MANAGER** | `manager@stockpilot.com` | `Manager@1234` | **Acheteur / Responsable Appro** |
| **ADMIN** | `admin@stockpilot.com` | `Admin@1234` | **Administrateur Central** |

---

### 📦 Articles & Fournisseurs Disponibles pour le Test

| Article (Catalogue) | SKU | Fournisseur Associé | Réf Fournisseur | Prix Base | Délai (Lead Time) | Palier Dégressif | Fournisseur Préféré ? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Moteur Électrique Triphasé 5kW** | `MOT-TRI-5KW` | **Acme Industrial Supplies** | `ACM-MTR-50` | 420.00 € | **3 jours** | **-8%** dès 10 pcs | ⭐ **OUI** (Préféré) |
| **Moteur Électrique Triphasé 5kW** | `MOT-TRI-5KW` | **Global Parts Logistics** | `GPL-MOT-05` | 440.00 € | **7 jours** | **-12%** dès 20 pcs | Non |
| **Roulement à Billes SKF 6204** | `ROU-SKF-6204` | **Acme Industrial Supplies** | `ACM-SKF-6204` | 22.00 € | **2 jours** | **-10%** dès 50 pcs | ⭐ **OUI** (Préféré) |
| **Roulement à Billes SKF 6204** | `ROU-SKF-6204` | **ElectroTech Solutions** | `ETS-RLM-6204` | 24.50 € | **5 jours** | **-15%** dès 100 pcs | Non |
| **Câble Cuivre Industriel 4mm²** | `CAB-CUV-4MM` | **ElectroTech Solutions** | `ETS-CAB-004` | 7.80 € | **4 jours** | **-12%** dès 200 m | ⭐ **OUI** (Préféré) |

---

### 🚶 Scénario de Test Guidé (Étape par Étape)

#### 🔵 Étape 1 : Le Magasinier exprime son besoin (Rôle `USER`)
1. Connectez-vous avec `user@stockpilot.com` / `User@1234`.
2. Allez dans le menu **"Demandes d'Achat"** (`/requisitions`).
3. Cliquez sur **"Nouvelle Demande"** :
   - Sélectionnez l'article : **`Moteur Électrique Triphasé 5kW`**.
   - Indiquez une quantité : **`12`** pièces (pour déclencher le palier dégressif dès 10 pièces).
   - Validez. La DA apparaît à l'état `DRAFT`.
4. Cliquez sur l'icône **Envoyer** (flèche) : la DA passe en statut `SUBMITTED`.
5. *Vérification du rôle* : Constatez que le compte `USER` n'a **pas** de bouton pour approuver ou commander cette DA.
6. Déconnectez-vous.

---

#### 🟢 Étape 2 : L'Acheteur valide et commande avec Fiche Info Achat (Rôle `MANAGER`)
1. Connectez-vous avec `manager@stockpilot.com` / `Manager@1234`.
2. Allez dans **"Demandes d'Achat"** (`/requisitions`) :
   - Constatez que le bouton vert **"Approuver"** est désormais visible.
   - Cliquez sur **Approuver** : la DA passe à l'état `APPROVED`.
3. Cliquez sur l'icône **Caddie** ("Générer le Bon de Commande") :
   - Une modale s'ouvre avec la **Fiche Info Achat** active !
   - Le système sélectionne automatiquement le fournisseur préféré : **`⭐ Acme Industrial Supplies`**.
   - Le délai de livraison de **3 jours** est automatiquement appliqué pour calculer la date prévue.
   - Comme vous avez demandé **12 pièces** ($\ge$ palier de 10 pièces), le système applique **automatiquement la remise de 8%** : le prix unitaire passe de `420.00 €` à **`386.40 €`** avec un badge de confirmation !
4. Cliquez sur **"Créer le Bon de Commande"**.
5. Allez dans le menu **"Commandes Fournisseurs"** (`/orders`) :
   - Retrouvez le bon de commande généré (`PO-XXXXX`).
   - Cliquez sur **"Émettre au Fournisseur"** pour basculer le PO en statut `ISSUED`.
6. Déconnectez-vous.

---

#### 🟡 Étape 3 : Le Magasinier réceptionne la livraison (Rôle `USER`)
1. Reconnectez-vous avec `user@stockpilot.com` / `User@1234`.
2. Allez dans le menu **"Réceptions Marchandises"** (`/goods-receipt`).
3. Cliquez sur **"Nouvelle Réception"** :
   - Sélectionnez le Bon de Commande émis (`PO-XXXXX`).
   - Saisissez le numéro de Bon de Livraison (BL) du transporteur (ex: `BL-TRANSPORT-8921`).
   - Indiquez la quantité reçue : **`12`**.
   - Cliquez sur **"Valider la Réception"**.
4. **Vérification automatique** :
   - Allez dans **"Stock & Magasin"** (`/inventory`) : le stock physique de moteurs a augmenté de 12 unités.
   - Allez dans **"Historique Mouvements"** (`/movements`) : un mouvement officiel immuable de type `GOODS_RECEIPT_PO (101)` est tracé avec la référence du BL transporteur.

---

## 5. ⚖️ Récapitulatif des Règles Métier

| Domaine | Statut | Règle Métier |
| :--- | :--- | :--- |
| **Fiche Info Achat (PIR)** | ✅ **Implémenté** | Association Article $\leftrightarrow$ Fournisseur avec prix de base, palier dégressif et lead time. |
| **Calcul Dégressif** | ✅ **Implémenté** | Détection automatique du volume commandé et application immédiate de la remise %. |
| **Lead Time** | ✅ **Implémenté** | Projection automatique de la date de livraison selon le délai fournisseur. |
| **Cycle DA $\rightarrow$ PO** | ✅ **Implémenté** | Interdiction formelle de commander sans approbation préalable d'un Manager (`APPROVED`). |
| **Ségrégation Rôles** | ✅ **Implémenté** | Magasinier = Demande & Réception ; Acheteur = Approbation & Commande ; Admin = Master Data. |
| **Anti-Sur-Livraison** | ✅ **Implémenté** | Blocage des réceptions supérieures au reliquat du bon de commande. |
| **Contrôle Facture** | ⏳ *Étape future* | 3-Way Matching (rapprochement Facture = Commande = Réception). |
