// Port dari Sukarame/app/lib/models/fnb_table.dart & models/booking.dart
export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface FnbTable {
  id: string
  branchId: string
  name: string
  capacity: number
  status: TableStatus
}

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Tersedia',
  occupied: 'Terisi',
  reserved: 'Reservasi',
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  branchId: string
  customerName: string | null
  customerPhone: string | null
  resourceRef: string | null
  startTime: string
  endTime: string | null
  status: BookingStatus
  createdAt: string
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  in_progress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress']
