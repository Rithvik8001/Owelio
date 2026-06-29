const AVATAR_GRADIENTS: [string, string][] = [
  ["#7D7AFF", "#5856D6"],
  ["#409CFF", "#007AFF"],
  ["#FF6584", "#FF2D55"],
  ["#3DD68C", "#34C759"],
  ["#FFB340", "#FF9500"],
  ["#40C8F4", "#32ADE6"],
  ["#DA8FFF", "#AF52DE"],
  ["#FF6B6B", "#FF3B30"],
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function UserAvatar({
  username,
  size = "md",
}: {
  username: string
  size?: "sm" | "md" | "lg"
}) {
  const [light, dark] = AVATAR_GRADIENTS[hashName(username) % AVATAR_GRADIENTS.length]
  const gradient = `linear-gradient(135deg, ${light} 0%, ${dark} 100%)`

  const sizeClass =
    size === "sm"
      ? "size-6 text-[9px]"
      : size === "lg"
        ? "size-10 text-xs"
        : "size-8 text-[10px]"

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide text-white shadow-sm ring-2 ring-white/20 ${sizeClass}`}
      style={{ background: gradient }}
    >
      {username.slice(0, 2).toUpperCase()}
    </div>
  )
}
