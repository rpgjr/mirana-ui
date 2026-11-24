import { cn } from "@/utils/cn"

/** Every ticket key looks the same, whatever its type. Color is left to tags and priority. */
export function KeyChip({ ticketKey, className }: { ticketKey: string; className?: string }) {
  return (
    <span className={cn("rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-foreground", className)}>
      {ticketKey}
    </span>
  )
}
