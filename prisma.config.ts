import { defineConfig } from 'prisma/config'
import path from 'node:path'

// Use DATABASE_URL if set, otherwise fall back to local SQLite
const dbUrl = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'dev.db')}`

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: dbUrl,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
