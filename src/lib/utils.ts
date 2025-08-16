import { format } from 'date-fns'

export function getCurrentGMTTime(): string {
  const now = new Date()
  const gmtTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}))
  return format(gmtTime, 'HH:mm')
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function calculateHours(timeIn: string, timeOut: string): number {
  const [inHours, inMinutes] = timeIn.split(':').map(Number)
  const [outHours, outMinutes] = timeOut.split(':').map(Number)
  
  const totalInMinutes = inHours * 60 + inMinutes
  const totalOutMinutes = outHours * 60 + outMinutes
  
  return (totalOutMinutes - totalInMinutes) / 60
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}