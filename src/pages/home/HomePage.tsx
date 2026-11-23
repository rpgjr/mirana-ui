import { useState } from "react"
import { Navigate } from "react-router-dom"
import { LuKanban, LuPlus } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { NewProjectDialog } from "@/components/common/modal"
import { useProjects } from "@/hooks/useProjects"

export function HomePage() {
  const { data: projects, isPending } = useProjects()
  const [open, setOpen] = useState(false)

  if (isPending) return <p className="text-sm text-muted-foreground">Loading</p>
  if (projects && projects.length > 0) return <Navigate to={`/projects/${projects[0].slug}`} replace />

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 pt-20 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-border bg-card text-primary">
        <LuKanban className="size-6" />
      </span>
      <h1 className="text-2xl font-semibold text-balance">Create your first project</h1>
      <p className="text-muted-foreground">A project holds one Kanban board. Ticket numbers like FT-00001 count up inside it.</p>
      <Button size="lg" onClick={() => setOpen(true)} className="h-10">
        <LuPlus data-icon="inline-start" />
        New project
      </Button>
      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
