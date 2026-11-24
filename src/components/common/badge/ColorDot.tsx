import { dotStyle } from "@/utils/color"
import { cn } from "@/utils/cn"

export function ColorDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn("size-2.5 shrink-0 rounded-full", className)} style={dotStyle(color)} aria-hidden="true" />
}
