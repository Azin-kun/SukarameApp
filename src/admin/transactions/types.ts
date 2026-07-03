// Port dari Sukarame/app/lib/models/transaction.dart
export interface TransactionItem {
  id: string
  nameSnapshot: string
  qty: number
  price: number
}

export interface Transaction {
  id: string
  branchId: string
  status: string
  subtotal: number
  total: number
  createdAt: string
  settledAt: string | null
  items: TransactionItem[]
}
