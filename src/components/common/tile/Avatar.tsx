import { cn } from "@/utils/cn"

export function Avatar({ name, className }: { name: string | null; className?: string }) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span
      className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-primary/20 font-mono text-[10px] font-semibold text-primary", className)}
      title={name ?? "Unassigned"}
      role="img"
      aria-label={name ?? "Unassigned"}
    >
      {initials}
    </span>
  )
}
