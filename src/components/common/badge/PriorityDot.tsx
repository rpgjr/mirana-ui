import { PRIORITY_LABEL } from "@/constants/ticket"
import { cn } from "@/utils/cn"
import type { Priority } from "@/types/project"

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-faint",
  MEDIUM: "bg-primary",
  HIGH: "bg-warning",
  URGENT: "bg-destructive",
}

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-block size-2 shrink-0 rounded-[3px]", PRIORITY_DOT[priority], className)} role="img" aria-label={`${PRIORITY_LABEL[priority]} priority`} />
  )
}
