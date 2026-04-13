import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'
import path from 'node:path'

// Resolve database URL:
// - Production/Railway: set DATABASE_URL in env (libsql:// or file:// on a volume)
// - Local dev: defaults to ./dev.db
function resolveDbUrl(): string {
  if (process.env.DATABASE_URL) {
    // If it's a relative file: path, make it absolute
    if (process.env.DATABASE_URL.startsWith('file:') && !process.env.DATABASE_URL.startsWith('file:/')) {
      const relativePath = process.env.DATABASE_URL.slice(5)
      return `file:${path.resolve(process.cwd(), relativePath)}`
    }
    return process.env.DATABASE_URL
  }
  return `file:${path.join(process.cwd(), 'dev.db')}`
}

function createPrismaClient() {
  const url = resolveDbUrl()
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter } as never)
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof createPrismaClient> | undefined
}

const prisma = globalThis.prismaGlobal ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
