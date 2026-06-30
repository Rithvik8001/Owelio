import { z } from "zod"

export const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be 20 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores."),
})

export type SettingsFormState =
  | {
      errors?: {
        username?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined
