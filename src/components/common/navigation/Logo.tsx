import { cn } from "@/utils/cn"

/** Crescent moon that doubles as a bow, with an arrow through it. The moon follows the text color. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={cn("size-7", className)}>
      <defs>
        <mask id="mirana-moon">
          <rect width="64" height="64" fill="#fff" />
          <circle cx="41" cy="25" r="19" fill="#000" />
        </mask>
      </defs>
      <circle cx="30" cy="34" r="23" fill="currentColor" mask="url(#mirana-moon)" />
      <path d="M13 53L52 14" stroke="#e0b86a" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M52 14l-12 2.5 9.5 9.5z" fill="#e0b86a" />
      <path d="M13 53l-1-8M13 53l8 1M18 48l-1-6M18 48l6 1" stroke="#e0b86a" strokeWidth="2.4" strokeLinecap="round" />
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
