import { Badge } from "@/components/ui/badge"

export function RoleBadge({ role }: { role: "owner" | "admin" | "member" }) {
  if (role === "owner") {
    return <Badge>Owner</Badge>
  }

  if (role === "admin") {
    return <Badge variant="secondary">Admin</Badge>
  }

  return <Badge variant="outline">Member</Badge>
}
