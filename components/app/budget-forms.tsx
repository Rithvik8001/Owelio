"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import {
  ArchiveIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react"
import {
  archiveBudget,
  createBudget,
  updateBudget,
} from "@/app/actions/budgets"
import { DatePickerInput } from "@/components/app/date-picker-input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { budgetScopes, type BudgetFormState } from "@/lib/validations/budgets"
import { expenseCategories } from "@/lib/validations/expenses"

export type EditableBudget = {
  id: string
  name: string
  scope: "overall" | "category"
  category: string
  amount: string
  startsAt: string
  endsAt: string
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function CreateBudgetDialog({ groupId }: { groupId: string }) {
  return (
    <BudgetDialog
      mode="create"
      groupId={groupId}
      trigger={
        <Button className="bg-zinc-900 hover:bg-zinc-700">
          <PlusIcon data-icon="inline-start" />
          New budget
        </Button>
      }
    />
  )
}

export function EditBudgetDialog({
  groupId,
  budget,
}: {
  groupId: string
  budget: EditableBudget
}) {
  return (
    <BudgetDialog
      mode="edit"
      groupId={groupId}
      budget={budget}
      trigger={
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <PencilIcon />
          Edit budget
        </DropdownMenuItem>
      }
    />
  )
}

function BudgetDialog({
  mode,
  groupId,
  budget,
  trigger,
}: {
  mode: "create" | "edit"
  groupId: string
  budget?: EditableBudget
  trigger: React.ReactNode
}) {
  const [scope, setScope] = useState<(typeof budgetScopes)[number]>(
    budget?.scope ?? "overall"
  )
  const [startsAt, setStartsAt] = useState(budget?.startsAt ?? "")
  const [endsAt, setEndsAt] = useState(budget?.endsAt ?? "")
  const [state, action, pending] = useActionState(
    mode === "edit" ? updateBudget : createBudget,
    undefined as BudgetFormState
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.message && mode === "create") {
      formRef.current?.reset()
      queueMicrotask(() => {
        setScope("overall")
        setStartsAt("")
        setEndsAt("")
      })
    }
  }, [mode, state])

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit budget" : "Create budget"}
          </DialogTitle>
          <DialogDescription>
            Add an optional spending plan for trips, events, or shared goals.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <input type="hidden" name="groupId" value={groupId} />
          {budget ? (
            <input type="hidden" name="budgetId" value={budget.id} />
          ) : null}
          <FieldGroup>
            {state?.errors?.form ? (
              <Field data-invalid>
                <FieldError>{state.errors.form[0]}</FieldError>
              </Field>
            ) : null}
            {state?.message ? (
              <Field>
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3 text-sm text-zinc-700">
                  {state.message}
                </div>
              </Field>
            ) : null}
            <Field data-invalid={Boolean(state?.errors?.name)}>
              <FieldLabel htmlFor={`${mode}-budget-name`}>Name</FieldLabel>
              <Input
                id={`${mode}-budget-name`}
                name="name"
                defaultValue={budget?.name}
                placeholder="Niagara trip"
                required
              />
              <FieldError>{state?.errors?.name?.[0]}</FieldError>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.scope)}>
                <FieldLabel>Scope</FieldLabel>
                <Select
                  name="scope"
                  value={scope}
                  onValueChange={(value) =>
                    setScope(value as (typeof budgetScopes)[number])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="overall">Overall group</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Overall budgets track all active expenses.
                </FieldDescription>
                <FieldError>{state?.errors?.scope?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.amount)}>
                <FieldLabel htmlFor={`${mode}-budget-amount`}>
                  Amount
                </FieldLabel>
                <Input
                  id={`${mode}-budget-amount`}
                  name="amount"
                  inputMode="decimal"
                  defaultValue={budget?.amount}
                  placeholder="1500.00"
                  required
                />
                <FieldError>{state?.errors?.amount?.[0]}</FieldError>
              </Field>
            </div>

            {scope === "category" ? (
              <Field data-invalid={Boolean(state?.errors?.category)}>
                <FieldLabel>Category</FieldLabel>
                <Select name="category" defaultValue={budget?.category}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {titleCase(category)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{state?.errors?.category?.[0]}</FieldError>
              </Field>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(state?.errors?.startsAt)}>
                <FieldLabel htmlFor={`${mode}-budget-starts-at`}>
                  Start date
                </FieldLabel>
                <DatePickerInput
                  id={`${mode}-budget-starts-at`}
                  name="startsAt"
                  value={startsAt}
                  onChange={setStartsAt}
                  placeholder="No start date"
                  clearable
                />
                <FieldError>{state?.errors?.startsAt?.[0]}</FieldError>
              </Field>
              <Field data-invalid={Boolean(state?.errors?.endsAt)}>
                <FieldLabel htmlFor={`${mode}-budget-ends-at`}>
                  End date
                </FieldLabel>
                <DatePickerInput
                  id={`${mode}-budget-ends-at`}
                  name="endsAt"
                  value={endsAt}
                  onChange={setEndsAt}
                  placeholder="No end date"
                  clearable
                />
                <FieldError>{state?.errors?.endsAt?.[0]}</FieldError>
              </Field>
            </div>

            <Button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-700"
              disabled={pending}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {mode === "edit" ? "Save changes" : "Create budget"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BudgetActions({
  groupId,
  budget,
}: {
  groupId: string
  budget: EditableBudget
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Budget actions">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditBudgetDialog groupId={groupId} budget={budget} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => event.preventDefault()}
            >
              <ArchiveIcon />
              Archive budget
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this budget?</AlertDialogTitle>
              <AlertDialogDescription>
                It will be hidden from active progress, but historical spending
                records stay unchanged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={archiveBudget}>
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="budgetId" value={budget.id} />
                <AlertDialogAction type="submit">Archive</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
