import { cn } from "@/utils/cn"

const TYPE_STYLE: Record<string, string> = {
  FT: "bg-ft/15 text-ft",
  HF: "bg-hf/15 text-hf",
  BUG: "bg-bug/15 text-bug",
}

export function KeyChip({ ticketKey, className }: { ticketKey: string; className?: string }) {
  const prefix = ticketKey.split("-")[0]
  return (
    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[11px] font-medium", TYPE_STYLE[prefix] ?? "bg-muted", className)}>
      {ticketKey}
    </span>
  )
}
