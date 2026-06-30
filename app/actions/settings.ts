"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { profiles } from "@/db/schema"
import { getDb } from "@/lib/db"
import { getUser } from "@/lib/session"
import {
  UpdateUsernameSchema,
  type SettingsFormState,
} from "@/lib/validations/settings"

function settingsError(message: string): SettingsFormState {
  return { errors: { form: [message] } }
}

function revalidateSettingsPaths() {
  revalidatePath("/settings")
  revalidatePath("/dashboard")
  revalidatePath("/groups")
}

export async function updateUsername(
  _state: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await getUser()
  if (!user) {
    return settingsError("You must be signed in.")
  }

  const validated = UpdateUsernameSchema.safeParse({
    username: formData.get("username"),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { username } = validated.data
  if (username === user.username) {
    return settingsError("This is already your current username.")
  }

  const db = getDb()
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.username, username),
    columns: { id: true },
  })
  if (existing) {
    return { errors: { username: ["This username is already taken."] } }
  }

  await db
    .update(profiles)
    .set({ username, updatedAt: new Date() })
    .where(eq(profiles.id, user.id))

  revalidateSettingsPaths()
  return { message: "Username updated." }
}
