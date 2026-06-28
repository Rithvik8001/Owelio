import { z } from "zod"

export const LoginSchema = z.object({
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
})

export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be 20 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores.")
    .trim(),
  email: z.email("Enter a valid email.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Must be at least 8 characters.")
    .regex(/[a-zA-Z]/, "Must contain at least one letter.")
    .regex(/[0-9]/, "Must contain at least one number."),
})

export type AuthFormState =
  | {
      errors?: {
        username?: string[]
        email?: string[]
        password?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined
