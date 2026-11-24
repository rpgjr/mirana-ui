import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import { LuKanban, LuPlus, LuSettings } from "react-icons/lu"

import { Wordmark } from "@/components/common/navigation"
import { UserMenu } from "@/components/common/navigation"
import { logout } from "@/services/authService"
import { NewProjectDialog } from "@/components/common/modal"
import { useProjects } from "@/hooks/useProjects"
import { ME_KEY, useMe } from "@/hooks/useAuth"
import { cn } from "@/utils/cn"

/** What a page can use from the shell. headerSlot is the left side of the top bar, where a page may render its own heading. */
export interface AppLayoutContext {
  headerSlot: HTMLElement | null
}

export function AppLayout() {
  const { data: user, isPending } = useMe()
  const qc = useQueryClient()
  const { data: projects } = useProjects()
  const [newProject, setNewProject] = useState(false)
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)
  const navigate = useNavigate()

  const out = useMutation({
    mutationFn: logout,
    onSettled: () => {
      qc.setQueryData(ME_KEY, null)
      qc.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" })
      navigate("/login", { replace: true })
    },
  })

  if (isPending) return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="grid min-h-dvh grid-cols-1 md:h-dvh md:grid-cols-[220px_1fr] md:overflow-hidden">
      <aside className="flex flex-col gap-1 border-b border-border bg-side p-3 md:sticky md:top-0 md:h-dvh md:overflow-y-auto md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-2 pt-1 pb-3 md:block">
          <Wordmark />
        </div>
        <nav aria-label="Projects" className="flex gap-1 overflow-x-auto md:flex-col">
          <span className="hidden px-2.5 pt-3 pb-1 font-mono text-[10px] tracking-widest text-faint uppercase md:block">Projects</span>
          {(projects ?? []).map((p) => (
            <NavLink
              key={p.slug}
              to={`/projects/${p.slug}`}
              className={({ isActive }) =>
                cn(
                  "flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground shadow-[inset_2px_0_0_var(--primary)]",
                )
              }
            >
              <LuKanban className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{p.name}</span>
              <span className="ml-auto font-mono text-[11px] text-faint">{p.ticketCount}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setNewProject(true)}
            className="flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LuPlus className="size-4" aria-hidden="true" />
            New project
          </button>
        </nav>
        <NewProjectDialog open={newProject} onOpenChange={setNewProject} />
        <nav aria-label="Settings" className="mt-auto hidden flex-col gap-1 border-t border-border pt-3 md:flex">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive && "bg-secondary text-foreground shadow-[inset_2px_0_0_var(--primary)]",
              )
            }
          >
            <LuSettings className="size-4" aria-hidden="true" />
            Settings
          </NavLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col md:min-h-0">
        <header className="flex min-h-14 items-center gap-4 border-b border-border px-5 py-2.5">
          <div ref={setHeaderSlot} className="flex min-w-0 flex-1 items-center" />
          <UserMenu name={user.displayName} email={user.email} onSignOut={() => out.mutate()} signingOut={out.isPending} />
        </header>
        <main className="thin-scroll flex-1 p-5 md:min-h-0 md:overflow-y-auto">
          <Outlet context={{ headerSlot } satisfies AppLayoutContext} />
        </main>
      </div>
    </div>
  )
}
