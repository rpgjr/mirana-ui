import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Open state for a dropdown that floats over the page. Closes on outside click or Escape, and says
 * whether to open upward when there is not enough room below the trigger.
 */
export function usePopover(panelHeight = 300) {
  const [open, setOpenState] = useState(false)
  const [up, setUp] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && root.current) {
        const r = root.current.getBoundingClientRect()
        const below = window.innerHeight - r.bottom
        setUp(below < panelHeight && r.top > below)
      }
      setOpenState(next)
    },
    [panelHeight],
  )

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpenState(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        setOpenState(false)
      }
    }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey, true)
    }
  }, [open])

  return { open, setOpen, up, root }
}
