import pkg from '@prisma/client'
const { PrismaClient } = pkg

// Ensure a single PrismaClient instance across hot-reloads in dev
// and across server utilities.
let prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export default getPrisma()
