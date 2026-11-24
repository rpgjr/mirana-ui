import { Avatar } from "./Avatar"
import { cn } from "@/utils/cn"

/** Overlapping avatars for several people. Shows the first few, then a +N circle. */
export function AvatarStack({ names, max = 3, className }: { names: string[]; max?: number; className?: string }) {
  if (names.length === 0) return null
  const shown = names.slice(0, max)
  const extra = names.length - shown.length
  return (
    <span className={cn("flex items-center", className)} role="img" aria-label={names.join(", ")} title={names.join(", ")}>
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} className={cn("size-6 text-[10px] ring-2 ring-secondary", i > 0 && "-ml-2")} />
      ))}
      {extra > 0 && (
        <span className="-ml-2 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold text-foreground ring-2 ring-secondary">+{extra}</span>
      )}
    </span>
  )
}
