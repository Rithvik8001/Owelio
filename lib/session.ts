import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { profiles } from "@/db/schema"
import { getDb } from "@/lib/db"

export const verifySession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return { userId: user.id, email: user.email! }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  const db = getDb()
  const result = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.userId),
    columns: { id: true, username: true, email: true },
  })
  return result ?? null
})
