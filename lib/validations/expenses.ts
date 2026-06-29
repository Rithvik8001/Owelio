import { z } from "zod"

export const expenseCategories = [
  "dining",
  "groceries",
  "transportation",
  "lodging",
  "utilities",
  "entertainment",
  "shopping",
  "health",
  "education",
  "services",
  "travel",
  "other",
] as const

export const expenseSplitMethods = ["equal", "exact", "percentage"] as const

export const ExpenseIdSchema = z.object({
  groupId: z.uuid("Invalid group."),
  expenseId: z.uuid("Invalid expense."),
})

export const SettlementIdSchema = z.object({
  groupId: z.uuid("Invalid group."),
  settlementId: z.uuid("Invalid settlement."),
})

export const CreateExpenseSchema = z.object({
  groupId: z.uuid("Invalid group."),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(100, "Title must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(280, "Notes must be 280 characters or fewer.")
    .optional()
    .or(z.literal("")),
  amount: z.string().trim().min(1, "Amount is required."),
  category: z.enum(expenseCategories),
  paidByMemberId: z.uuid("Choose who paid."),
  expenseDate: z.string().trim().min(1, "Date is required."),
  splitMethod: z.enum(expenseSplitMethods),
  participantIds: z.array(z.uuid()).min(1, "Choose at least one participant."),
})

export const UpdateExpenseSchema = CreateExpenseSchema.extend({
  expenseId: z.uuid("Invalid expense."),
})

export const RecordSettlementSchema = z.object({
  groupId: z.uuid("Invalid group."),
  fromMemberId: z.uuid("Choose who paid."),
  toMemberId: z.uuid("Choose who received payment."),
  amount: z.string().trim().min(1, "Amount is required."),
  settledDate: z.string().trim().min(1, "Date is required."),
  note: z
    .string()
    .trim()
    .max(180, "Note must be 180 characters or fewer.")
    .optional()
    .or(z.literal("")),
})

export type ExpenseFormState =
  | {
      errors?: {
        title?: string[]
        description?: string[]
        amount?: string[]
        category?: string[]
        paidByMemberId?: string[]
        expenseDate?: string[]
        splitMethod?: string[]
        participantIds?: string[]
        splits?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined

export type SettlementFormState =
  | {
      errors?: {
        fromMemberId?: string[]
        toMemberId?: string[]
        amount?: string[]
        settledDate?: string[]
        note?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined
