"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("next") ?? "/dashboard"

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="font-heading text-xl font-semibold text-zinc-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Start splitting expenses the honest way
          </p>
        </div>

        {state?.errors?.form && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.errors.form[0]}
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="yourname"
              autoComplete="username"
              required
            />
            {state?.errors?.username ? (
              <p className="text-xs text-red-500">{state.errors.username[0]}</p>
            ) : (
              <p className="text-xs text-zinc-400">
                Letters, numbers, and underscores only
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <p className="text-xs text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password ? (
              <ul className="space-y-0.5">
                {state.errors.password.map((e) => (
                  <li key={e} className="text-xs text-red-500">
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400">
                Min 8 chars, include a letter and number
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-10 w-full bg-zinc-900 hover:bg-zinc-700"
            disabled={pending}
          >
            {pending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Create account
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
