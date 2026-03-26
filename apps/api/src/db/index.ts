import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@mykite/database/schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL not set, using mock mode')
}

// Lazy initialization to allow running without DB during development
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db && connectionString) {
    const client = postgres(connectionString)
    _db = drizzle(client, { schema })
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const database = getDb()
    if (!database) {
      throw new Error('Database not available. Set DATABASE_URL environment variable.')
    }
    return (database as any)[prop]
  },
})

export { schema }
