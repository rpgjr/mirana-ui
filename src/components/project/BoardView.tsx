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
import { Link } from "react-router-dom"
import { LuMessageSquare } from "react-icons/lu"

import { cn } from "@/utils/cn"

import type { Board, Column, TicketCard } from "@/types/project"
import { useMoveTicket } from "@/hooks/useProjects"
import { Avatar } from "@/components/common/tile"
import { KeyChip } from "@/components/common/badge"
import { PrBadge } from "@/components/common/badge"
import { PriorityDot } from "@/components/common/badge"

const COLUMN_ID = (id: number) => `col-${id}`

export function BoardView({ board, basePath }: { board: Board; basePath: string }) {
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
    move.mutate({ key, columnId: to.id, position })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <div className="grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-4">
        {board.columns.map((c) => (
          <BoardColumn key={c.id} column={c} basePath={basePath} />
        ))}
      </div>
      <DragOverlay>{active ? <Card ticket={active} basePath={basePath} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}

function BoardColumn({ column, basePath }: { column: Column; basePath: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: COLUMN_ID(column.id) })
  return (
    <section aria-label={column.name} className="flex min-h-[320px] min-w-0 flex-col gap-2 rounded-xl border border-border bg-card/70 p-2.5">
      <header className="flex items-center justify-between px-1.5 pt-0.5 pb-1 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        <h2>{column.name}</h2>
        <span className="rounded-full bg-secondary px-2 py-px">{column.tickets.length}</span>
      </header>
      <div ref={setNodeRef} className={cn("flex flex-1 flex-col gap-2 rounded-lg transition-colors", isOver && "bg-primary/5")}>
        <SortableContext items={column.tickets.map((t) => t.key)} strategy={verticalListSortingStrategy}>
          {column.tickets.map((t) => (
            <SortableCard key={t.key} ticket={t} basePath={basePath} />
          ))}
        </SortableContext>
        {column.tickets.length === 0 && <p className="px-2 py-6 text-center text-xs text-faint">Drop a ticket here</p>}
      </div>
    </section>
  )
}

function SortableCard({ ticket, basePath }: { ticket: TicketCard; basePath: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.key })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && "opacity-40")}>
      <Card ticket={ticket} basePath={basePath} dragProps={{ ...attributes, ...listeners }} />
    </div>
  )
}

function Card({ ticket, basePath, dragProps, overlay }: { ticket: TicketCard; basePath: string; dragProps?: Record<string, unknown>; overlay?: boolean }) {
  return (
    <Link
      to={`${basePath}/t/${ticket.key}`}
      {...dragProps}
      draggable={false}
      aria-label={`${ticket.key} ${ticket.title}. Press space to lift, arrow keys to move, enter to open.`}
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-border bg-secondary p-3 text-left transition-[border-color,box-shadow] outline-none hover:border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        overlay && "cursor-grabbing border-primary shadow-lg",
      )}
    >
      <span className="text-[13.5px] leading-snug text-foreground">{ticket.title}</span>
      <span className="flex items-center gap-2.5 font-mono text-[11px] text-muted-foreground">
        <KeyChip ticketKey={ticket.key} type={ticket.type} />
        <PrBadge count={ticket.prCount} state={ticket.prState} />
        {ticket.commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <LuMessageSquare className="size-3" aria-hidden="true" />
            {ticket.commentCount}
          </span>
        )}
        <span className="flex-1" />
        <PriorityDot priority={ticket.priority} />
        {ticket.assigneeName && <Avatar name={ticket.assigneeName} className="size-5 text-[9px]" />}
      </span>
    </Link>
  )
}
