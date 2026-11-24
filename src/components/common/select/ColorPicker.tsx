import { useEffect, useId, useState } from "react"
import { LuCheck } from "react-icons/lu"

import { usePopover } from "@/hooks/usePopover"
import { cn } from "@/utils/cn"
import { colorName, isHex, PALETTE } from "@/utils/color"

/** A round swatch that opens a palette and a hex box. Any hex color is allowed, the palette is just a quick start. */
export function ColorPicker({ value, onChange, label }: { value: string; onChange: (hex: string) => void; label: string }) {
  const { open, setOpen, up, root } = usePopover(250)
  const [text, setText] = useState(value)
  const listId = useId()
  useEffect(() => setText(value), [value])

  const commit = (v: string) => {
    const hex = v.startsWith("#") ? v : `#${v}`
    if (isHex(hex)) onChange(hex.toLowerCase())
    else setText(value)
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={`${label}: ${colorName(value)}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="grid size-9 place-items-center rounded-lg border border-input bg-input/30 transition-colors hover:bg-input/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="size-5 rounded-full ring-1 ring-foreground/20" style={{ backgroundColor: value }} />
      </button>

      {open && (
        <div
          id={listId}
          role="dialog"
          aria-label={label}
          className={cn(
            "pop-in absolute left-0 z-50 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl shadow-black/40",
            up ? "bottom-full mb-2 [transform-origin:bottom_left]" : "top-full mt-2 [transform-origin:top_left]",
          )}
        >
          <div role="radiogroup" aria-label="Colors" className="grid grid-cols-6 gap-2">
            {PALETTE.map((c) => {
              const on = c.hex.toLowerCase() === value.toLowerCase()
              return (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => {
                    onChange(c.hex)
                    setOpen(false)
                  }}
                  className="grid size-8 place-items-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: c.hex }}
                >
                  {on && <LuCheck className="size-4 text-white drop-shadow" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-input" title="Pick any color">
              <input type="color" value={isHex(value) ? value : "#64748b"} onChange={(e) => onChange(e.target.value.toLowerCase())} aria-label="Pick any color" className="absolute -inset-2 size-14 cursor-pointer border-0 bg-transparent p-0" />
            </label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => commit(text)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit(text))}
              maxLength={7}
              spellCheck={false}
              aria-label="Hex color"
              placeholder="#3b82f6"
              className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-input/30 px-3 font-mono text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      )}
    </div>
  )
}
