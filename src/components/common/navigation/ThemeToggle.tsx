import { LuMonitor, LuMoon, LuSun } from "react-icons/lu"
import type { IconType } from "react-icons"

import { useTheme, type ThemeChoice } from "@/context/ThemeContext"
import { cn } from "@/utils/cn"

const OPTIONS: { value: ThemeChoice; label: string; Icon: IconType }[] = [
  { value: "dark", label: "Dark", Icon: LuMoon },
  { value: "light", label: "Light", Icon: LuSun },
  { value: "system", label: "System", Icon: LuMonitor },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { choice, setChoice } = useTheme()
  return (
    <div role="group" aria-label="Theme" className={cn("inline-flex rounded-full border border-input bg-card p-0.5", className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={`${label} theme`}
          aria-pressed={choice === value}
          onClick={() => setChoice(value)}
          className={cn(
            "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
            choice === value && "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
