import { NavLink, Outlet } from "react-router-dom"
import { LuGithub, LuUserRound } from "react-icons/lu"

import { cn } from "@/utils/cn"

const TABS = [
  { to: "/settings/account", label: "Account", icon: LuUserRound },
  { to: "/settings/github", label: "GitHub", icon: LuGithub },
]

export function SettingsLayout() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <nav aria-label="Settings sections" className="mt-3 flex gap-1 border-b border-border">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "border-primary text-foreground",
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
