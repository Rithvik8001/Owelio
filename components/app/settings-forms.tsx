"use client"

import { useActionState } from "react"
import { SaveIcon } from "lucide-react"
import { updateUsername } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { SettingsFormState } from "@/lib/validations/settings"

export function UsernameForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(
    updateUsername,
    undefined as SettingsFormState
  )

  return (
    <form action={action}>
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
        <Field data-invalid={Boolean(state?.errors?.username)}>
          <FieldLabel htmlFor="settings-username">Username</FieldLabel>
          <Input
            id="settings-username"
            name="username"
            defaultValue={username}
            autoComplete="username"
            required
          />
          <FieldDescription>
            Letters, numbers, and underscores only. Your username appears across
            groups and expenses.
          </FieldDescription>
          <FieldError>{state?.errors?.username?.[0]}</FieldError>
        </Field>
        <Button
          type="submit"
          className="w-fit bg-zinc-900 hover:bg-zinc-700"
          disabled={pending}
        >
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save username
        </Button>
      </FieldGroup>
    </form>
  )
}
