const GROUP_COLORS = [
  "#7C3AED",
  "#059669",
  "#D97706",
  "#2563EB",
  "#E11D48",
  "#F472B6",
  "#64748B",
  "#FB923C",
]

export function groupColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return GROUP_COLORS[Math.abs(hash) % GROUP_COLORS.length]
}

export function GroupAvatar({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const color = groupColor(name)
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 rounded-lg text-[11px]"
      : size === "lg"
        ? "h-12 w-12 rounded-xl text-base"
        : "h-9 w-9 rounded-xl text-sm"

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}
