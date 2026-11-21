import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type ThemeChoice = "light" | "dark" | "system"

const STORAGE_KEY = "mirana-theme"

interface ThemeState {
  choice: ThemeChoice
  resolved: "light" | "dark"
  setChoice: (c: ThemeChoice) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

function readChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "light" || v === "dark" || v === "system") return v
  } catch {
    // storage blocked, fall back to the default
  }
  return "dark"
}

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(readChoice)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const resolved = choice === "system" ? (systemDark ? "dark" : "light") : choice

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark")
  }, [resolved])

  const value = useMemo<ThemeState>(
    () => ({
      choice,
      resolved,
      setChoice: (c) => {
        setChoiceState(c)
        try {
          localStorage.setItem(STORAGE_KEY, c)
        } catch {
          // ignore
        }
      },
    }),
    [choice, resolved],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
