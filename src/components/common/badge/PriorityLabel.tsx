import { chipStyle } from "@/utils/color"
import { cn } from "@/utils/cn"
import type { PriorityConfig } from "@/types/project"

/** Priority as plain text, colored by the project's setting. */
export function PriorityLabel({ priorityId, priorities, className }: { priorityId: number; priorities: PriorityConfig[]; className?: string }) {
  const cfg = priorities.find((p) => p.id === priorityId)
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold", className)} style={chipStyle(cfg?.color ?? "#64748b")}>
      {cfg?.name ?? "None"}
    </span>
  )
}
