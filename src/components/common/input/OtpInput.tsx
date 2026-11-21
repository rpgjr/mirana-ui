import { useRef } from "react"

import { cn } from "@/utils/cn"

const LENGTH = 6

interface Props {
  value: string
  onChange: (v: string) => void
  onComplete?: (v: string) => void
  invalid?: boolean
  disabled?: boolean
}

export function OtpInput({ value, onChange, onComplete, invalid, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "")

  const commit = (next: string) => {
    onChange(next)
    if (next.length === LENGTH) onComplete?.(next)
  }

  return (
    <div role="group" aria-label="6 digit verification code" className="grid grid-cols-6 gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          onChange={(e) => {
            const c = e.target.value.replace(/\D/g, "").slice(-1)
            const chars = digits.slice()
            chars[i] = c
            commit(chars.join("").slice(0, LENGTH))
            if (c && i < LENGTH - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus()
            if (e.key === "ArrowRight" && i < LENGTH - 1) refs.current[i + 1]?.focus()
          }}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH)
            if (!t) return
            e.preventDefault()
            commit(t)
            refs.current[Math.min(t.length, LENGTH - 1)]?.focus()
          }}
          className={cn(
            "h-14 w-full min-w-0 rounded-lg border border-input bg-card text-center font-mono text-2xl outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50",
            invalid && "border-destructive",
          )}
        />
      ))}
    </div>
  )
}
