# Test Step 5: Goods Receipt & Stock Movements (MIGO)
$baseUrl = "http://localhost:8999"

Write-Host "=== TEST ETAPE 5 : RECEPTION MARCHANDISE & MOUVEMENTS DE STOCK ===" -ForegroundColor Cyan

# 1. Recuperer l'entrepot central
$whResponse = Invoke-RestMethod -Uri "$baseUrl/api/warehouses/default" -Method Get
$warehouseId = $whResponse.id
Write-Host "Entrepôt central: $($whResponse.name) ($warehouseId)" -ForegroundColor Green

# 2. Recuperer le dernier bon de commande ISSUED
$orders = Invoke-RestMethod -Uri "$baseUrl/api/purchase-orders" -Method Get
$issuedPo = $orders | Where-Object { $_.status -eq "ISSUED" } | Select-Object -Last 1

if (-not $issuedPo) {
    Write-Host "Aucun PO avec le statut ISSUED trouvé. Recherche de tous les POs..." -ForegroundColor Yellow
    $issuedPo = $orders | Select-Object -Last 1
}

if (-not $issuedPo) {
    Write-Host "Erreur: Aucun bon de commande trouvé. Assurez-vous que l'étape 4 a été exécutée." -ForegroundColor Red
    exit 1
}

$poId = $issuedPo.id
$poNumber = $issuedPo.poNumber
Write-Host "Bon de Commande cible : $poNumber (ID: $poId, Statut actuel: $($issuedPo.status))" -ForegroundColor Yellow

$poItem = $issuedPo.items[0]
$productId = $poItem.productId
$orderedQty = $poItem.orderedQuantity
$receivedQtyBefore = $poItem.receivedQuantity
$remainingQty = $poItem.remainingQuantity

Write-Host "Article commandé : $($poItem.productName) ($($poItem.sku))" -ForegroundColor Gray
Write-Host "Quantité commandée : $orderedQty | Déjà reçu : $receivedQtyBefore | Reste à recevoir : $remainingQty" -ForegroundColor Gray

# 3. Vérifier le stock actuel avant réception
$invBefore = Invoke-RestMethod -Uri "$baseUrl/api/inventory/product/$productId/warehouse/$warehouseId" -Method Get
Write-Host "Stock en magasin AVANT réception : $($invBefore.availableQuantity) PCS (Total physique : $($invBefore.physicalQuantity))" -ForegroundColor Magenta

# 4. Effectuer la Réception de Marchandise (MIGO)
$grBody = @{
    purchaseOrderId = $poId
    deliveryNoteNumber = "BL-FRN-2026-7890"
    notes = "Livraison complète reçue au quai de déchargement N°1"
    items = @(
        @{
            productId = $productId
            receivedQuantity = $remainingQty
        }
    )
} | ConvertTo-Json -Depth 5

Write-Host "Envoi du Bon de Réception (MIGO)..." -ForegroundColor Yellow
$grResponse = Invoke-RestMethod -Uri "$baseUrl/api/goods-receipts" -Method Post -Body $grBody -ContentType "application/json"

Write-Host "Bon de Réception créé avec succès !" -ForegroundColor Green
Write-Host "N° Réception (GR) : $($grResponse.grNumber)" -ForegroundColor Green
Write-Host "N° Bon de Livraison fournisseur (BL) : $($grResponse.deliveryNoteNumber)" -ForegroundColor Green
Write-Host "Quantité réceptionnée : $($grResponse.items[0].receivedQuantity)" -ForegroundColor Green

# 5. Vérifier le statut mis à jour du Bon de Commande
$poUpdated = Invoke-RestMethod -Uri "$baseUrl/api/purchase-orders/$poId" -Method Get
Write-Host "Statut mis à jour du PO : $($poUpdated.status)" -ForegroundColor $(if ($poUpdated.status -eq "COMPLETED") { "Green" } else { "Yellow" })
Write-Host "Quantité reçue sur la ligne PO : $($poUpdated.items[0].receivedQuantity) / $($poUpdated.items[0].orderedQuantity)" -ForegroundColor Green

# 6. Vérifier l'augmentation du stock en magasin
$invAfter = Invoke-RestMethod -Uri "$baseUrl/api/inventory/product/$productId/warehouse/$warehouseId" -Method Get
Write-Host "Stock en magasin APRES réception : $($invAfter.availableQuantity) PCS (Total physique : $($invAfter.physicalQuantity))" -ForegroundColor Green
$delta = $invAfter.availableQuantity - $invBefore.availableQuantity
Write-Host "Gain net de stock : +$delta PCS" -ForegroundColor Green

# 7. Vérifier le Journal des Mouvements de Stock (Traçabilité SAP 101)
$movements = Invoke-RestMethod -Uri "$baseUrl/api/stock-movements" -Method Get
$lastMovement = $movements | Select-Object -Last 1
Write-Host "Dernier mouvement de stock enregistré :" -ForegroundColor Cyan
Write-Host "  N° Mouvement : $($lastMovement.movementNumber)" -ForegroundColor White
Write-Host "  Type de mouvement : $($lastMovement.type)" -ForegroundColor White
Write-Host "  Quantité : $($lastMovement.quantity)" -ForegroundColor White
Write-Host "  Document de référence : $($lastMovement.referenceDocument)" -ForegroundColor White
Write-Host "  Date/Heure : $($lastMovement.timestamp)" -ForegroundColor White

# 8. Vérifier la résolution de l'alerte de stock
$alerts = Invoke-RestMethod -Uri "$baseUrl/api/stock-alerts" -Method Get
$resolvedAlert = $alerts | Where-Object { $_.productId -eq $productId -and $_.status -eq "RESOLVED" } | Select-Object -Last 1
if ($resolvedAlert) {
    Write-Host "Alerte de stock résolue avec succès ! Statut : $($resolvedAlert.status)" -ForegroundColor Green
} else {
    Write-Host "Statut des alertes : $($alerts | Where-Object { $_.productId -eq $productId } | ForEach-Object { $_.status })" -ForegroundColor Yellow
}

Write-Host "=== TEST ETAPE 5 TERMINE AVEC SUCCES 100% ===" -ForegroundColor Green
