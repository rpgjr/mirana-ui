import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { TagChip } from "@/components/common/badge"
import type { Tag } from "@/types/project"

const SHOWN = 2

/** The first two tags, then a +N button that opens the full list. The list is placed on the page, so a scrolling table never clips it. */
export function TagOverflow({ tags, empty = <span className="text-faint">None</span> }: { tags: Tag[]; empty?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !button.current?.contains(t)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", close)
    window.addEventListener("scroll", close, true)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", close)
      window.removeEventListener("scroll", close, true)
    }
  }, [open])

  if (tags.length === 0) return <>{empty}</>

  // This also sits inside cards and rows that open the ticket on click, so clicks here must stop at the button and the panel.
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()
  const toggle = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault()
    e.stopPropagation()
    if (!open && button.current) {
      const r = button.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 280) })
    }
    setOpen((o) => !o)
  }

  return (
    <span className="flex items-center gap-1.5">
      {tags.slice(0, SHOWN).map((t) => (
        <TagChip key={t.id} tag={t} className="max-w-28 truncate" />
      ))}
      {tags.length > SHOWN && (
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-label={`Show all ${tags.length} tags`}
          onClick={toggle}
          onPointerDown={stop}
          className="rounded-full border border-input bg-card px-2 py-0.5 text-xs font-semibold text-foreground hover:border-foreground/60"
        >
          +{tags.length - SHOWN}
        </button>
      )}
      {open &&
        createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-label="All tags"
            onClick={stop}
            onPointerDown={stop}
            style={{ top: pos.top, left: pos.left }}
            className="pop-in pop-in-left fixed z-50 flex w-64 flex-wrap gap-1.5 rounded-lg border border-border bg-popover p-3 shadow-xl shadow-black/40"
          >
            {tags.map((t) => (
              <TagChip key={t.id} tag={t} />
            ))}
          </div>,
          document.body,
        )}
    </span>
  )
}
