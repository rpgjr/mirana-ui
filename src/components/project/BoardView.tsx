import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/utils/cn"
import { dotStyle } from "@/utils/color"

import type { Board, Column, TicketCard } from "@/types/project"
import { useMoveTicket } from "@/hooks/useProjects"
import { AvatarStack } from "@/components/common/tile"
import { KeyChip } from "@/components/common/badge"
import { PriorityLabel } from "@/components/common/badge"
import { TagOverflow } from "@/components/project/TagOverflow"

const COLUMN_ID = (id: number) => `col-${id}`

/** board is what is shown, possibly filtered. fullBoard has every ticket, so a drop onto a filtered column can land at the real end. */
export function BoardView({ board, fullBoard, basePath }: { board: Board; fullBoard: Board; basePath: string }) {
  const filtered = board !== fullBoard
  const slug = board.project.slug
  const move = useMoveTicket(slug)
  const [active, setActive] = useState<TicketCard | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Space lifts a card, arrows move it. Enter stays free so it opens the ticket.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] } }),
  )

  const findColumn = (id: string | number): Column | undefined => {
    const s = String(id)
    if (s.startsWith("col-")) return board.columns.find((c) => COLUMN_ID(c.id) === s)
    return board.columns.find((c) => c.tickets.some((t) => t.key === s))
  }

  const onDragStart = (e: DragStartEvent) => {
    setActive(board.columns.flatMap((c) => c.tickets).find((t) => t.key === e.active.id) ?? null)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActive(null)
    const { active: a, over } = e
    if (!over) return
    const to = findColumn(over.id)
    if (!to) return
    const key = String(a.id)
    const from = findColumn(key)
    if (!from) return
    const overIsColumn = String(over.id).startsWith("col-")
    const targetTickets = to.tickets.filter((t) => t.key !== key)
    const overIndex = overIsColumn ? targetTickets.length : to.tickets.findIndex((t) => t.key === over.id)
    const position = overIsColumn ? targetTickets.length : Math.max(0, overIndex)
    const oldIndex = from.tickets.findIndex((t) => t.key === key)
    if (from.id === to.id && oldIndex === position) return
    if (filtered) {
      // Hidden tickets make the visible order unreliable, so only a change of column counts, and it goes to the end.
      if (from.id === to.id) return
      const fullTo = fullBoard.columns.find((c) => c.id === to.id)
      move.mutate({ key, columnId: to.id, position: fullTo ? fullTo.tickets.length : position })
      return
    }
    move.mutate({ key, columnId: to.id, position })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <div className="thin-scroll grid min-h-0 min-w-0 flex-1 auto-cols-[24rem] grid-flow-col grid-rows-[minmax(0,1fr)] gap-4 overflow-x-auto pb-1">
        {board.columns.map((c) => (
          <BoardColumn key={c.id} column={c} board={board} basePath={basePath} filtered={filtered} />
        ))}
      </div>
      <DragOverlay>{active ? <Card ticket={active} board={board} basePath={basePath} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}

function BoardColumn({ column, board, basePath, filtered }: { column: Column; board: Board; basePath: string; filtered: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: COLUMN_ID(column.id) })
  return (
    <section aria-label={column.name} className="flex max-h-[80dvh] min-h-[320px] min-w-0 flex-col gap-3 rounded-xl border border-border bg-card/70 p-3 md:max-h-none">
      <header className="flex items-center justify-between px-1.5 pt-0.5 pb-1">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-foreground uppercase">
          <span className="size-2.5 rounded-full" style={dotStyle(column.color)} aria-hidden="true" />
          {column.name}
        </h2>
        <span className="min-w-6 rounded-full border border-border bg-secondary px-2 py-0.5 text-center text-xs font-semibold text-foreground">{column.tickets.length}</span>
      </header>
      <div ref={setNodeRef} className={cn("thin-scroll -mr-2.5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-lg pr-1 transition-colors", isOver && "bg-primary/5")}>
        <SortableContext items={column.tickets.map((t) => t.key)} strategy={verticalListSortingStrategy}>
          {column.tickets.map((t) => (
            <SortableCard key={t.key} ticket={t} board={board} basePath={basePath} />
          ))}
        </SortableContext>
        {column.tickets.length === 0 && <p className="px-2 py-6 text-center text-xs text-faint">{filtered ? "No matching tickets" : "Drop a ticket here"}</p>}
      </div>
    </section>
  )
}

function SortableCard({ ticket, board, basePath }: { ticket: TicketCard; board: Board; basePath: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.key })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-40")}>
      <Card ticket={ticket} board={board} basePath={basePath} dragProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function Card({ ticket, board, basePath, dragProps, overlay }: { ticket: TicketCard; board: Board; basePath: string; dragProps?: Record<string, unknown>; overlay?: boolean }) {
  const { search } = useLocation()
  const tags = ticket.tagIds.map((id) => board.tags.find((t) => t.id === id)).filter((t) => !!t)
  return (
    <Link
      to={{ pathname: `${basePath}/t/${ticket.key}`, search }}
      {...dragProps}
      draggable={false}
      aria-label={`${ticket.key} ${ticket.title}. Press space to lift, arrow keys to move, enter to open.`}
      className={cn(
        "fade-up flex flex-col gap-3 rounded-lg border border-border bg-secondary p-4 text-left transition-[border-color,box-shadow] duration-100 outline-none hover:border-foreground hover:ring-1 hover:ring-inset hover:ring-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        overlay && "cursor-grabbing border-primary shadow-lg",
      )}
    >
      <span className="flex h-6 items-center justify-between gap-2">
        <KeyChip ticketKey={ticket.key} />
        <PriorityLabel priorityId={ticket.priorityId} priorities={board.priorities} />
      </span>
      <span className="flex min-h-[4.5rem] flex-col gap-1.5">
        <span className="line-clamp-2 text-base leading-snug font-semibold text-foreground">{ticket.title}</span>
        <time dateTime={ticket.createdAt} title={new Date(ticket.createdAt).toLocaleString()} className="text-xs text-muted-foreground">
          {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </time>
      </span>
      <span className="flex h-7 items-center gap-3">
        <span className="min-w-0 flex-1">
          <TagOverflow tags={tags} empty={null} />
        </span>
        <AvatarStack names={ticket.assignees.map((a) => a.name)} className="shrink-0" />
      </span>
    </Link>
  )
}
