// Port dari Sukarame/app/lib/models/shift.dart (class StaffShift)
export interface StaffShift {
  id: string
  branchId: string
  staffProfileId: string | null
  openingCash: number
  closingCash: number | null
  openedAt: string
  closedAt: string | null
}
