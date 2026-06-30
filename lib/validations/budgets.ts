import { z } from "zod"
import { expenseCategories } from "@/lib/validations/expenses"

export const budgetScopes = ["overall", "category"] as const

const BudgetFieldsSchema = z
  .object({
    groupId: z.uuid("Invalid group."),
    name: z
      .string()
      .trim()
      .min(2, "Budget name must be at least 2 characters.")
      .max(80, "Budget name must be 80 characters or fewer."),
    scope: z.enum(budgetScopes),
    category: z.enum(expenseCategories).optional().or(z.literal("")),
    amount: z.string().trim().min(1, "Amount is required."),
    startsAt: z.string().trim().optional().or(z.literal("")),
    endsAt: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.scope === "category" && !data.category) {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Choose a category.",
      })
    }
  })

export const CreateBudgetSchema = BudgetFieldsSchema

export const UpdateBudgetSchema = BudgetFieldsSchema.extend({
  budgetId: z.uuid("Invalid budget."),
})

export const ArchiveBudgetSchema = z.object({
  groupId: z.uuid("Invalid group."),
  budgetId: z.uuid("Invalid budget."),
})

export type BudgetFormState =
  | {
      errors?: {
        name?: string[]
        scope?: string[]
        category?: string[]
        amount?: string[]
        startsAt?: string[]
        endsAt?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined
