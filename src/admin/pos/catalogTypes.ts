// Port dari Sukarame/app/lib/models/catalog_item.dart
export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface CatalogItem {
  id: string
  categoryId: string
  name: string
  price: number
  isActive: boolean
  photoUrl: string | null
}

export interface CartItem {
  item: CatalogItem
  qty: number
  note?: string
}
