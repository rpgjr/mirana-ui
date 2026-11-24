import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react"
import { LuCheck, LuChevronDown, LuSearch } from "react-icons/lu"

import { usePopover } from "@/hooks/usePopover"
import { cn } from "@/utils/cn"

export interface DropdownOption {
  value: string
  label: string
  /** A dot, avatar or other mark shown before the label, in the list and on the button. */
  icon?: ReactNode
  hint?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder?: string
  id?: string
  className?: string
  disabled?: boolean
  searchPlaceholder?: string
}

/** One choice from a list. Same look as MultiSelect. The list floats over the page, so the layout never grows when it opens. */
export function Dropdown({ value, onChange, options, placeholder = "Select", id, className, disabled, searchPlaceholder = "Search" }: Props) {
  const { open, setOpen, up, root } = usePopover(options.length > 6 ? 300 : 40 + options.length * 36)
  const [query, setQuery] = useState("")
  const listId = useId()
  const current = options.find((o) => o.value === value)
  const searchable = options.length > 7

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery("")
  }

  // Arrow keys move between the options. Enter and Space pick the focused one because they are buttons.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    items[Math.max(0, Math.min(items.length - 1, at + (e.key === "ArrowDown" ? 1 : -1)))]?.focus()
  }

  return (
    <div ref={root} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-input/30 px-3 text-left text-sm outline-none transition-colors hover:bg-input/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <span className={cn("flex min-w-0 items-center gap-2", !current && "text-muted-foreground")}>
          {current?.icon}
          <span className="truncate">{current?.label ?? placeholder}</span>
        </span>
        <LuChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listId}
          className={cn(
            "pop-in absolute z-50 w-full min-w-48 overflow-hidden rounded-lg border border-border bg-popover shadow-xl shadow-black/40",
            up ? "bottom-full mb-1 [transform-origin:bottom_left]" : "top-full mt-1 [transform-origin:top_left]",
          )}
        >
          {searchable && (
            <label className="flex items-center gap-2 border-b border-border px-3">
              <LuSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </label>
          )}
          <div role="listbox" className="thin-scroll max-h-60 overflow-y-auto py-1">
            {shown.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">No match.</p>}
            {shown.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => pick(o.value)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
              >
                {o.icon}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                {o.value === value && <LuCheck className="size-4 shrink-0" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
