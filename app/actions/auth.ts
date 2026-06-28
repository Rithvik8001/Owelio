"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { profiles } from "@/db/schema"
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
  }

  const validated = SignupSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { username, email, password } = validated.data

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
    redirect("/login?confirmed=1")
  }

  redirect("/dashboard")
}

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validated = LoginSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { errors: { form: ["Invalid email or password."] } }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
