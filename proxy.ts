import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/groups", "/invitations", "/settings"]
const authRoutes = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && user) {
    const next = request.nextUrl.searchParams.get("next")
    return NextResponse.redirect(new URL(getSafeRedirect(next), request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}

function getSafeRedirect(next: string | null) {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next
  }

  return "/dashboard"
}
