import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { Link, Navigate, useLocation, useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom"
import { LuListChecks, LuPlus, LuSettings, LuSquareKanban } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { ApiError } from "@/services/apiClient"
import type { AppLayoutContext } from "@/layouts/AppLayout"
import { cn } from "@/utils/cn"
import { BoardView } from "@/components/project"
import { useBoard } from "@/hooks/useProjects"
import { ListView } from "@/components/project"
import { NewTicketDialog } from "@/components/project"
import { RepoList, TicketFilters, TicketModal } from "@/components/project"
import { countTickets, filterBoard, readFilters, writeFilters } from "@/utils/ticketFilters"

export function ProjectPage({ view }: { view: "board" | "list" }) {
  const { slug = "", key } = useParams()
  const { headerSlot } = useOutletContext<AppLayoutContext>()
  const navigate = useNavigate()
  const { data: board, isPending, error } = useBoard(slug)
  const [creating, setCreating] = useState(false)
  const [params, setParams] = useSearchParams()
  const { search } = useLocation()
  const filters = useMemo(() => readFilters(params), [params])
  const visible = useMemo(() => (board ? filterBoard(board, filters) : undefined), [board, filters])

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/" replace />
  if (isPending) return <p className="text-sm text-muted-foreground">Loading board</p>
  if (error || !board || !visible) return <p className="text-sm text-destructive">Could not load this project. Try again.</p>

  const base = `/projects/${slug}${view === "list" ? "/list" : ""}`
  const tabs = [
    { to: { pathname: `/projects/${slug}`, search }, label: "Board", Icon: LuSquareKanban, on: view === "board" },
    { to: { pathname: `/projects/${slug}/list`, search }, label: "List", Icon: LuListChecks, on: view === "list" },
  ]

  return (
    <div className="flex h-full min-w-0 flex-col gap-5">
      {headerSlot &&
        createPortal(
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5">
            <h1 className="truncate text-lg font-semibold">{board.project.name}</h1>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
            <RepoList repos={board.project.repos} />
          </div>,
          headerSlot,
        )}

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <TicketFilters
          board={board}
          value={filters}
          onChange={(f) => setParams(writeFilters(params, f), { replace: true })}
          shown={countTickets(visible)}
          total={countTickets(board)}
        />
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="View" className="relative inline-grid grid-cols-2 rounded-lg border border-input bg-card p-0.5">
            <span
              aria-hidden="true"
              className="absolute top-0.5 bottom-0.5 left-0.5 w-24 rounded-md bg-secondary shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.3,0.9,0.3,1)]"
              style={{ transform: view === "list" ? "translateX(100%)" : "translateX(0)" }}
            />
            {tabs.map(({ to, label, Icon, on }) => (
              <Link
                key={label}
                to={to}
                role="tab"
                aria-selected={on}
                className={cn("relative z-10 flex h-8 w-24 items-center justify-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground", on && "text-foreground")}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
          <Button size="lg" onClick={() => setCreating(true)} className="h-9">
            <LuPlus data-icon="inline-start" />
            New ticket
          </Button>
          <Button variant="secondary" size="icon-lg" className="border border-input" render={<Link to={`/projects/${slug}/settings`} />} aria-label="Project settings" title="Project settings">
            <LuSettings />
          </Button>
        </div>
      </div>

      {view === "board" ? <BoardView board={visible} fullBoard={board} basePath={base} /> : <ListView board={visible} basePath={base} />}

      <NewTicketDialog board={board} open={creating} onOpenChange={setCreating} onCreated={(k) => navigate({ pathname: `${base}/t/${k}`, search })} />
      <TicketModal board={board} ticketKey={key} onClose={() => navigate({ pathname: base, search })} />
    </div>
  )
}
