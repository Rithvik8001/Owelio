"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { profiles } from "@/db/schema"
import { getDb } from "@/lib/db"
import {
  LoginSchema,
  SignupSchema,
  type AuthFormState,
} from "@/lib/validations/auth"

export async function signup(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  }

  const validated = SignupSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { username, email, password, redirectTo } = validated.data
  const db = getDb()

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.username, username),
    columns: { id: true },
  })
  if (existing) {
    return { errors: { username: ["This username is already taken."] } }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    return { errors: { form: [error?.message ?? "Failed to create account."] } }
  }

  await db.insert(profiles).values({
    id: data.user.id,
    username,
    email,
  })

  if (!data.session) {
    redirect(`/login?confirmed=1&next=${encodeURIComponent(redirectTo)}`)
  }

  redirect(redirectTo)
}

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  }

  const validated = LoginSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password, redirectTo } = validated.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { errors: { form: ["Invalid email or password."] } }
  }

  redirect(redirectTo)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
