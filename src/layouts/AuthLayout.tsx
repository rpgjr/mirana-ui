import type { ReactNode } from "react"

import { Wordmark } from "@/components/common/navigation"
import { ThemeToggle } from "@/components/common/navigation"

interface Props {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="moon-arc flex min-h-dvh flex-col pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between py-5">
        <Wordmark />
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-6 pb-16">
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl font-semibold text-balance">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">{children}</div>
        {footer && <p className="text-center text-sm text-muted-foreground">{footer}</p>}
      </main>
    </div>
  )
}
