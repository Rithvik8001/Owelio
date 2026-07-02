import { z } from "zod"
import {
  expenseCategories,
  expenseSplitMethods,
} from "@/lib/validations/expenses"

export const recurringBillFrequencies = ["weekly", "monthly", "yearly"] as const

export const RecurringBillIdSchema = z.object({
  groupId: z.uuid("Invalid group."),
  recurringBillId: z.uuid("Invalid recurring bill."),
})

export const RecurringBillFieldsSchema = z.object({
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
  paidByMemberId: z.uuid("Choose who pays."),
  splitMethod: z.enum(expenseSplitMethods),
  frequency: z.enum(recurringBillFrequencies),
  nextDueDate: z.string().trim().min(1, "Next due date is required."),
  participantIds: z.array(z.uuid()).min(1, "Choose at least one participant."),
})

export const CreateRecurringBillSchema = RecurringBillFieldsSchema

export const UpdateRecurringBillSchema = RecurringBillFieldsSchema.extend({
  recurringBillId: z.uuid("Invalid recurring bill."),
})

export type RecurringBillFormState =
  | {
      errors?: {
        title?: string[]
        description?: string[]
        amount?: string[]
        category?: string[]
        paidByMemberId?: string[]
        splitMethod?: string[]
        frequency?: string[]
        nextDueDate?: string[]
        participantIds?: string[]
        splits?: string[]
        form?: string[]
      }
      message?: string
    }
  | undefined
