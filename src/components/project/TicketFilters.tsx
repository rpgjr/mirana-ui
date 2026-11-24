import { useEffect, useRef, useState } from "react"
import { LuListFilter, LuSearch, LuX } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { ColorDot } from "@/components/common/badge"
import { MultiSelect } from "@/components/common/select"
import { cn } from "@/utils/cn"
import { isFiltering, NO_FILTERS, type TicketFilterState } from "@/utils/ticketFilters"
import type { Board } from "@/types/project"

interface Props {
  board: Board
  value: TicketFilterState
  onChange: (f: TicketFilterState) => void
  shown: number
  total: number
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  )
}

/** Search box and one Filters button. The filters open together in a panel, so the toolbar stays calm. They live in the address, so a filtered view can be shared. */
export function TicketFilters({ board, value, onChange, shown, total }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const set = (patch: Partial<TicketFilterState>) => onChange({ ...value, ...patch })
  const active = isFiltering(value)
  const chosen = value.assignee.length + value.priority.length + value.tag.length

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="flex items-center gap-2">
      {active && <span className="hidden text-sm whitespace-nowrap text-muted-foreground lg:inline" aria-live="polite">{shown} of {total}</span>}

      <label className="relative w-48 sm:w-72 lg:w-96">
        <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search ID or title"
          aria-label="Search tickets by ID or title"
          className="h-9 w-full rounded-lg border border-input bg-input/30 pr-8 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {value.q && (
          <button type="button" onClick={() => set({ q: "" })} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <LuX className="size-4" aria-hidden="true" />
          </button>
        )}
      </label>

      <div ref={root} className="relative">
        <Button type="button" variant="secondary" size="lg" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)} className={cn("h-9 border border-input", chosen > 0 && "border-ring")}>
          <LuListFilter data-icon="inline-start" />
          Filters
          {chosen > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{chosen}</span>}
        </Button>

        {open && (
          <div role="dialog" aria-label="Filters" className="pop-in absolute top-full right-0 z-40 mt-2 flex w-80 flex-col gap-4 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl shadow-black/50">
            <Field label="Assignee">
              <MultiSelect
                placeholder="Anyone"
                searchPlaceholder="Search people"
                value={value.assignee}
                onChange={(assignee) => set({ assignee })}
                options={[{ value: "none", label: "Unassigned" }, ...board.members.map((m) => ({ value: String(m.id), label: m.displayName }))]}
              />
            </Field>
            <Field label="Priority">
              <MultiSelect
                placeholder="Any priority"
                searchPlaceholder="Search priorities"
                value={value.priority}
                onChange={(priority) => set({ priority })}
                options={board.priorities.map((p) => ({ value: String(p.id), label: p.name, icon: <ColorDot color={p.color} /> }))}
              />
            </Field>
            <Field label="Tags">
              <MultiSelect
                placeholder={board.tags.length ? "Any tag" : "No tags yet"}
                searchPlaceholder="Search tags"
                value={value.tag}
                onChange={(tag) => set({ tag })}
                options={board.tags.map((t) => ({ value: String(t.id), label: t.name }))}
              />
            </Field>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">{active ? `${shown} of ${total} tickets` : `${total} tickets`}</span>
              <Button type="button" variant="ghost" size="sm" disabled={!active} onClick={() => onChange(NO_FILTERS)}>
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
