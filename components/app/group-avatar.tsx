const AVATAR_GRADIENTS: [string, string][] = [
  ["#FF6B6B", "#FF3B30"],
  ["#FFB340", "#FF9500"],
  ["#3DD68C", "#34C759"],
  ["#40C8F4", "#32ADE6"],
  ["#409CFF", "#007AFF"],
  ["#7D7AFF", "#5856D6"],
  ["#DA8FFF", "#AF52DE"],
  ["#FF6584", "#FF2D55"],
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function groupColor(name: string): string {
  const [light, dark] =
    AVATAR_GRADIENTS[hashName(name) % AVATAR_GRADIENTS.length]
  return `linear-gradient(135deg, ${light} 0%, ${dark} 100%)`
}

export function GroupAvatar({
  name,
  size = "md",
}: {
  name: string
  size?: "sm" | "md" | "lg"
}) {
  const gradient = groupColor(name)
  const sizeClass =
    size === "sm"
      ? "size-7 text-[11px]"
      : size === "lg"
        ? "size-12 text-base"
        : "size-9 text-sm"

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide text-white shadow-sm ring-2 ring-white/20 ${sizeClass}`}
      style={{ background: gradient }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}
