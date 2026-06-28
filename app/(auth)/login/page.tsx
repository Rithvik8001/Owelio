"use client"

import Link from "next/link"
import { useActionState } from "react"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const confirmed = searchParams.get("confirmed")

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="font-heading text-xl font-semibold text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Sign in to your Owelio account
          </p>
        </div>

        {confirmed && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Email confirmed! You can now sign in.
          </div>
        )}

        {state?.errors?.form && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.errors.form[0]}
          </div>
        )}

        <form action={action} className="space-y-4">
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
              autoComplete="current-password"
              required
            />
            {state?.errors?.password && (
              <p className="text-xs text-red-500">{state.errors.password[0]}</p>
            )}
          </div>

          <Button type="submit" className="h-10 w-full bg-zinc-900 hover:bg-zinc-700" disabled={pending}>
            {pending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Sign in
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
