import { useId, useState } from "react"
import { LuEye, LuEyeOff } from "react-icons/lu"

import { Input } from "./input"
import { Label } from "@/components/common/form"
import { cn } from "@/utils/cn"

import { MIN_PASSWORD, passwordChecks, passwordScore } from "@/utils/passwordRules"

const METER_COLORS = ["bg-destructive", "bg-warning", "bg-primary", "bg-success"]

interface Props {
  label?: string
  value: string
  onChange: (v: string) => void
  email?: string
  error?: string
  /** Show the live rules and strength meter (sign up and reset). */
  showRules?: boolean
  autoComplete: "current-password" | "new-password"
  id?: string
}

export function PasswordField({ label = "Password", value, onChange, email = "", error, showRules, autoComplete, id }: Props) {
  const auto = useId()
  const inputId = id ?? auto
  const [visible, setVisible] = useState(false)
  const checks = passwordChecks(value, email)
  const score = passwordScore(value, email)

  const rules: [boolean, string][] = [
    [checks.length, `${MIN_PASSWORD} or more characters`],
    [checks.common, "Not a common password"],
    [checks.email, "Does not contain your email name"],
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={showRules ? `${inputId}-rules` : undefined}
          placeholder={showRules ? `At least ${MIN_PASSWORD} characters` : "Your password"}
          className="h-11 pr-11 text-base"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1 right-1 grid size-9 place-items-center rounded-md text-muted-foreground hover:text-foreground"
        >
          {visible ? <LuEyeOff className="size-[18px]" /> : <LuEye className="size-[18px]" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {showRules && (
        <div id={`${inputId}-rules`} className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 rounded-full bg-input transition-colors", i < score && METER_COLORS[score - 1])} />
            ))}
          </div>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {rules.map(([ok, text]) => (
              <li key={text} className={cn("flex items-center gap-2", ok && "text-foreground")}>
                <span className={cn("size-3 shrink-0 rounded-full border-[1.5px] border-input", ok && "border-success bg-success")} />
                {text}
                <span className="sr-only">{ok ? "met" : "not met"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
