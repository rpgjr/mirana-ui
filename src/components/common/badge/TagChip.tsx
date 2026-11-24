import { chipStyle } from "@/utils/color"
import { cn } from "@/utils/cn"
import type { Tag } from "@/types/project"

export function TagChip({ tag, className }: { tag: Tag; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)} style={chipStyle(tag.color)}>
      {tag.name}
    </span>
  )
}
