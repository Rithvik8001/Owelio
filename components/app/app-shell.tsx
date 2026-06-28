"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type AppShellUser = {
  username: string
  email: string
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Groups", href: "/groups", icon: UsersIcon },
  { label: "Invitations", href: "/invitations", icon: BellIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

function initials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

export function AppShell({
  user,
  pendingInvites,
  children,
}: {
  user: AppShellUser
  pendingInvites: number
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href="/dashboard">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
                    O
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="font-heading text-sm font-semibold text-zinc-900">
                      Owelio
                    </span>
                    <span className="truncate text-xs text-zinc-500">
                      Shared expenses
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.href === "/invitations" && pendingInvites > 0 ? (
                        <SidebarMenuBadge>{pendingInvites}</SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white p-2">
            <Avatar className="size-8">
              <AvatarFallback>{initials(user.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
              <div className="truncate text-sm font-medium text-zinc-900">
                @{user.username}
              </div>
              <div className="truncate text-xs text-zinc-500">{user.email}</div>
            </div>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-zinc-500 hover:text-zinc-900"
            >
              <LogOutIcon data-icon="inline-start" />
              <span>Sign out</span>
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-zinc-50/60">
        <header className="sticky top-0 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-xl md:px-6">
          <SidebarTrigger />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="truncate font-heading text-sm font-semibold text-zinc-900">
              Owelio
            </div>
            {pendingInvites > 0 ? (
              <Badge variant="secondary">{pendingInvites} pending</Badge>
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
