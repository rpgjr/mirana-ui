import { cn } from "@/utils/cn"

/** Placeholder mark until the tiger-and-archer logo is drawn. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <path
        d="M4 8l5 3c2-1 5-1.5 7-1.5S21 10 23 11l5-3-1 8c1 3 0 7-3 9l-3 4h-10l-3-4c-3-2-4-6-3-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11 17h2M19 17h2M14 22l2 1.5 2-1.5M16 6v3" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-[0.22em]">MIRANA</span>
    </span>
  )
}
