import type { CSSProperties } from "react"

/** Colors offered in the picker. Any other hex color can be typed in. */
export const PALETTE: { name: string; hex: string }[] = [
  { name: "Slate", hex: "#64748b" },
  { name: "Red", hex: "#ef4444" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Fuchsia", hex: "#d946ef" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Sky", hex: "#0ea5e9" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Green", hex: "#22c55e" },
  { name: "Lime", hex: "#84cc16" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Orange", hex: "#f97316" },
]

export const DEFAULT_COLOR = "#3b82f6"

export const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v)

export const colorName = (hex: string) => PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex.toUpperCase()

/** A solid dot. */
export const dotStyle = (hex: string): CSSProperties => ({ backgroundColor: hex })

/**
 * A soft badge: a faint fill and text mixed toward the page's text color, so it stays readable
 * on a dark page and on a light page whatever hex is chosen.
 */
export const chipStyle = (hex: string): CSSProperties => ({
  backgroundColor: `color-mix(in oklab, ${hex} 20%, transparent)`,
  color: `color-mix(in oklab, ${hex} 62%, var(--foreground))`,
})
