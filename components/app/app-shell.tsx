"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BellIcon,
  HomeIcon,
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
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

type AppShellUser = {
  username: string
  email: string
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
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
    <TooltipProvider>
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        {/* Logo header — exactly h-14 to align with SidebarInset header */}
        <SidebarHeader className="p-0 border-b border-zinc-200/80">
          {/* Expanded */}
          <div className="flex h-14 items-center px-5 group-data-[collapsible=icon]:hidden">
            <Link
              href="/dashboard"
              className="font-heading text-[1.1rem] font-bold tracking-tight text-zinc-900"
            >
              Owelio
            </Link>
          </div>
          {/* Collapsed */}
          <div className="hidden h-14 items-center justify-center group-data-[collapsible=icon]:flex">
            <span className="font-heading text-sm font-bold text-zinc-900">
              O
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
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

        <SidebarFooter className="border-t border-zinc-200/80 p-2">
          {/* Expanded: full user card + sign out */}
          <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-1">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white p-2">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>{initials(user.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
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
          </div>
          {/* Collapsed: just the avatar centered, fits within 48px */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center py-1">
            <Avatar className="size-8">
              <AvatarFallback>{initials(user.username)}</AvatarFallback>
            </Avatar>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-screen bg-zinc-50/60">
        <header className="sticky top-0 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-xl md:px-6">
          <SidebarTrigger />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="truncate font-heading text-sm font-semibold text-zinc-900">
              {navItems.find(
                (item) =>
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)
              )?.label ?? "Owelio"}
            </div>
            {pendingInvites > 0 ? (
              <Badge variant="secondary">{pendingInvites} pending</Badge>
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}
