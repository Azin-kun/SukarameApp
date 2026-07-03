// Port dari Sukarame/app/lib/models/inventory_item.dart
export interface InventoryItem {
  id: string
  catalogItemId: string
  branchId: string
  itemName: string
  stockQty: number
  lowStockThreshold: number
  unit: string | null
}
