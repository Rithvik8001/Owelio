import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

type Database = ReturnType<typeof drizzle<typeof schema>>

let client: ReturnType<typeof postgres> | null = null
let db: Database | null = null

export function getDb() {
  if (!client) {
    client = postgres(process.env.DATABASE_URL!, { prepare: false })
  }

  if (!db) {
    db = drizzle(client, { schema })
  }

  return db
}
