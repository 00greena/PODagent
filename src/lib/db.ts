import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a dummy Prisma instance during build time
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    // Return a dummy client during build
    console.warn('DATABASE_URL not set during build')
    return null as any
  }
  return new PrismaClient()
}

export const prisma = global.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  global.prisma = prisma
}