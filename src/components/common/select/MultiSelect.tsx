import { useEffect, useId, useMemo, useRef, useState } from "react"
import { LuCheck, LuChevronDown, LuSearch, LuX } from "react-icons/lu"

import { cn } from "@/utils/cn"

export interface MultiOption {
  value: string
  hint?: string
  disabled?: boolean
}

interface Props {
  options: MultiOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  max?: number
  id?: string
  className?: string
}

/** Dropdown with a checkbox per option and a search box. The list opens in the page flow, so a dialog never clips it. */
export function MultiSelect({ options, value, onChange, placeholder, max, id, className }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey, true)
    }
  }, [open])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.value.toLowerCase().includes(q)) : options
  }, [options, query])

  const full = max !== undefined && value.length >= max
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div ref={root} className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-input/30 px-3 text-sm outline-none transition-colors hover:bg-input/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className={cn("truncate", !value.length && "text-muted-foreground")}>
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <LuChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div id={listId} className="overflow-hidden rounded-lg border border-border bg-card">
          <label className="flex items-center gap-2 border-b border-border px-3">
            <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories"
              aria-label="Search repositories"
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <ul className="max-h-52 overflow-y-auto py-1">
            {shown.length === 0 && <li className="px-3 py-2 text-sm text-muted-foreground">No match.</li>}
            {shown.map((o) => {
              const checked = value.includes(o.value)
              const blocked = o.disabled || (full && !checked)
              return (
                <li key={o.value}>
                  <label className={cn("flex items-center gap-2.5 px-3 py-1.5 text-sm", blocked ? "opacity-50" : "cursor-pointer hover:bg-secondary")}>
                    <input type="checkbox" checked={checked} disabled={blocked} onChange={() => toggle(o.value)} className="peer sr-only" />
                    <span className="grid size-4 shrink-0 place-items-center rounded border border-input peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50">
                      {checked && <LuCheck className="size-3 text-primary-foreground" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{o.value}</span>
                    {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {v}
              <button type="button" aria-label={`Remove ${v}`} onClick={() => toggle(v)} className="hover:text-destructive">
                <LuX className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
