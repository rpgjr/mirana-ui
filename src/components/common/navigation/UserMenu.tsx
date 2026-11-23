import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { LuCheck, LuChevronDown, LuLogOut, LuMonitor, LuMoon, LuSettings, LuSun } from "react-icons/lu"
import type { IconType } from "react-icons"

import { useTheme, type ThemeChoice } from "@/context/ThemeContext"
import { cn } from "@/utils/cn"

const THEMES: { value: ThemeChoice; label: string; Icon: IconType }[] = [
  { value: "dark", label: "Dark", Icon: LuMoon },
  { value: "light", label: "Light", Icon: LuSun },
  { value: "system", label: "System", Icon: LuMonitor },
]

const ITEM = "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-left transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"

/** Name in the header. Opens a small menu with the theme choice, settings and sign out. */
export function UserMenu({ name, email, onSignOut, signingOut }: { name: string; email: string; onSignOut: () => void; signingOut: boolean }) {
  const [open, setOpen] = useState(false)
  const { choice, setChoice } = useTheme()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="max-w-40 truncate">{name}</span>
        <LuChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" aria-label="Account menu" className="absolute right-0 z-50 mt-1.5 w-60 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
          <div className="truncate px-2.5 pt-1.5 pb-2 font-mono text-xs text-muted-foreground">{email}</div>
          <div className="border-t border-border pt-1.5">
            <div className="px-2.5 pb-1 font-mono text-[10px] tracking-widest text-faint uppercase">Theme</div>
            {THEMES.map(({ value, label, Icon }) => (
              <button key={value} type="button" role="menuitemradio" aria-checked={choice === value} onClick={() => setChoice(value)} className={ITEM}>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                {label}
                {choice === value && <LuCheck className="ml-auto size-4" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="mt-1.5 border-t border-border pt-1.5">
            <Link to="/settings/account" role="menuitem" onClick={() => setOpen(false)} className={ITEM}>
              <LuSettings className="size-4 text-muted-foreground" aria-hidden="true" />
              Settings
            </Link>
            <button type="button" role="menuitem" disabled={signingOut} onClick={onSignOut} className={cn(ITEM, "disabled:opacity-50")}>
              <LuLogOut className="size-4 text-muted-foreground" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
