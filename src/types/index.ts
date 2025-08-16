export interface PODEntry {
  id?: string
  podImage?: string
  jobSheetImage?: string
  timeIn: string
  timeOut: string
  deliveryAddress?: string
  referenceNumber?: string
  extractedData?: any
  createdAt?: Date
  weekNumber?: number
  year?: number
}

export interface WeeklyData {
  weekNumber: number
  year: number
  entries: PODEntry[]
  totalHours: number
}