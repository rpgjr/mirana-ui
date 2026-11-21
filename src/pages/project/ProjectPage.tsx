import { useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { LuKanban, LuListChecks, LuPlus } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { ApiError } from "@/services/apiClient"
import { cn } from "@/utils/cn"
import { BoardView } from "@/components/project"
import { useBoard } from "@/hooks/useProjects"
import { ListView } from "@/components/project"
import { NewTicketDialog } from "@/components/project"
import { RepoList, TicketModal } from "@/components/project"

export function ProjectPage({ view }: { view: "board" | "list" }) {
  const { slug = "", key } = useParams()
  const navigate = useNavigate()
  const { data: board, isPending, error } = useBoard(slug)
  const [creating, setCreating] = useState(false)

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/" replace />
  if (isPending) return <p className="text-sm text-muted-foreground">Loading board</p>
  if (error || !board) return <p className="text-sm text-destructive">Could not load this project. Try again.</p>

  const base = `/projects/${slug}${view === "list" ? "/list" : ""}`
  const tabs = [
    { to: `/projects/${slug}`, label: "Board", Icon: LuKanban, on: view === "board" },
    { to: `/projects/${slug}/list`, label: "List", Icon: LuListChecks, on: view === "list" },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto flex min-w-0 flex-col">
          <h1 className="text-xl font-semibold">{board.project.name}</h1>
          <RepoList slug={slug} repos={board.project.repos} canEdit={board.project.role === "OWNER"} />
        </div>
        <div role="tablist" aria-label="View" className="inline-flex rounded-lg border border-input bg-card p-0.5">
          {tabs.map(({ to, label, Icon, on }) => (
            <Link
              key={to}
              to={to}
              role="tab"
              aria-selected={on}
              className={cn("flex h-8 items-center gap-1.5 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground", on && "bg-secondary text-foreground")}
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
      </div>

      {view === "board" ? <BoardView board={board} basePath={base} /> : <ListView board={board} basePath={base} />}

      <NewTicketDialog board={board} open={creating} onOpenChange={setCreating} onCreated={(k) => navigate(`${base}/t/${k}`)} />
      <TicketModal board={board} ticketKey={key} onClose={() => navigate(base)} />
    </div>
  )
}
