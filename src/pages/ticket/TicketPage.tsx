import { createPortal } from "react-dom"
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom"
import { LuArrowLeft } from "react-icons/lu"

import { ApiError } from "@/services/apiClient"
import { useBoard, useTicket } from "@/hooks/useProjects"
import { TicketBody } from "@/components/project"
import type { AppLayoutContext } from "@/layouts/AppLayout"

/** Standalone ticket page. The modal's "Open in new tab" link lands here. */
export function TicketPage() {
  const { slug = "", key = "" } = useParams()
  const { headerSlot } = useOutletContext<AppLayoutContext>()
  const board = useBoard(slug)
  const ticket = useTicket(slug, key)

  const notFound = [board.error, ticket.error].some((e) => e instanceof ApiError && e.status === 404)
  if (notFound) return <Navigate to="/" replace />
  if (board.isPending || ticket.isPending) return <p className="text-sm text-muted-foreground">Loading ticket</p>
  if (!board.data || !ticket.data) return <p className="text-sm text-destructive">Could not load this ticket. Try again.</p>

  return (
    <div className="flex h-full min-w-0 flex-col gap-4">
      {headerSlot &&
        createPortal(
          <Link to={`/projects/${slug}`} className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <LuArrowLeft className="size-4" aria-hidden="true" />
            Back to {board.data.project.name}
          </Link>,
          headerSlot,
        )}
      <div className="flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-sm lg:min-h-0">
        <TicketBody key={ticket.data.key} board={board.data} ticket={ticket.data} />
      </div>
    </div>
  )
}
