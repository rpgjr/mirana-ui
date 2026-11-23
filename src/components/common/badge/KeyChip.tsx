import { cn } from "@/utils/cn"
import type { TicketType } from "@/types/project"

const TYPE_STYLE: Record<TicketType, string> = {
  FEATURE: "bg-ft/15 text-ft",
  HOTFIX: "bg-hf/15 text-hf",
  BUGFIX: "bg-bug/15 text-bug",
}

/** The color follows the ticket type, so it still works when a project uses its own prefixes. */
export function KeyChip({ ticketKey, type, className }: { ticketKey: string; type?: TicketType; className?: string }) {
  return (
    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[11px] font-medium", type ? TYPE_STYLE[type] : "bg-muted", className)}>
      {ticketKey}
    </span>
  )
}
