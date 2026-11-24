import { useMemo, useState, type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from "react-icons/lu"

import type { Board, TicketCard } from "@/types/project"
import { AvatarStack } from "@/components/common/tile"
import { KeyChip, PriorityLabel } from "@/components/common/badge"
import { TagOverflow } from "@/components/project/TagOverflow"
import { ColorDot } from "@/components/common/badge"
import { cn } from "@/utils/cn"

type SortKey = "ticket" | "status" | "priority" | "assignee" | "created"
type Row = TicketCard & { column: string; colorKey: string; order: number; rank: number }

const dateOf = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

const COMPARE: Record<SortKey, (a: Row, b: Row) => number> = {
  ticket: (a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }),
  status: (a, b) => a.order - b.order,
  priority: (a, b) => a.rank - b.rank,
  assignee: (a, b) => {
    const x = a.assignees[0]?.name
    const y = b.assignees[0]?.name
    if (!x) return y ? 1 : 0
    if (!y) return -1
    return x.localeCompare(y)
  },
  created: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
}

function Th({ children, sort, current, dir, onSort, className }: { children: ReactNode; sort?: SortKey; current: SortKey | null; dir: "asc" | "desc"; onSort: (k: SortKey) => void; className?: string }) {
  const active = sort !== undefined && current === sort
  const Icon = !active ? LuArrowUpDown : dir === "asc" ? LuArrowUp : LuArrowDown
  return (
    <th scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined} className={cn("px-4 py-2.5 font-semibold uppercase", className)}>
      {sort ? (
        <button type="button" onClick={() => onSort(sort)} className={cn("-mx-1.5 inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 uppercase hover:bg-foreground/10 hover:text-foreground", active && "text-foreground")}>
          {children}
          <Icon className={cn("size-3.5", !active && "opacity-50")} aria-hidden="true" />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export function ListView({ board, basePath }: { board: Board; basePath: string }) {
  const { search } = useLocation()
  const navigate = useNavigate()
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null)

  const rows = useMemo(() => {
    const list: Row[] = board.columns.flatMap((c, i) => c.tickets.map((t) => ({ ...t, column: c.name, colorKey: c.color, order: i, rank: board.priorities.findIndex((p) => p.id === t.priorityId) })))
    if (!sort) return list
    const cmp = COMPARE[sort.key]
    // Ties keep the board order, so sorting by priority still reads top to bottom by status.
    return [...list].sort((a, b) => (sort.dir === "asc" ? cmp(a, b) : cmp(b, a)) || a.order - b.order)
  }, [board, sort])

  // Click once for ascending, again for descending, a third time to go back to board order.
  const onSort = (key: SortKey) =>
    setSort((cur) => (cur?.key !== key ? { key, dir: "asc" } : cur.dir === "asc" ? { key, dir: "desc" } : null))

  if (rows.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">No tickets match. Create one, or clear the filters.</p>
  const head = { current: sort?.key ?? null, dir: sort?.dir ?? "asc", onSort } as const

  return (
    <div className="thin-scroll overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[1100px] table-fixed text-sm">
        <colgroup>
          <col className="w-36" />
          <col />
          <col className="w-40" />
          <col className="w-32" />
          <col className="w-44" />
          <col className="w-52" />
          <col className="w-32" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground">
            <Th sort="ticket" {...head}>Ticket</Th>
            <Th {...head}>Title</Th>
            <Th sort="status" {...head}>Status</Th>
            <Th sort="priority" {...head}>Priority</Th>
            <Th sort="assignee" {...head}>Assignee</Th>
            <Th {...head}>Tags</Th>
            <Th sort="created" {...head}>Created</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr
              key={t.key}
              onClick={(e) => {
                // The title is a real link, so clicks on it (or any link) keep their normal behavior.
                if (!(e.target as HTMLElement).closest("a, button")) navigate({ pathname: `${basePath}/t/${t.key}`, search })
              }}
              className="cursor-pointer border-b border-border transition-colors last:border-0 odd:bg-transparent even:bg-foreground/[0.045] hover:bg-foreground/[0.12] hover:outline hover:-outline-offset-1 hover:outline-foreground/50"
            >
              <td className="px-4 py-2.5"><KeyChip ticketKey={t.key} /></td>
              <td className="px-4 py-2.5">
                <Link to={{ pathname: `${basePath}/t/${t.key}`, search }} title={t.title} className="block truncate font-semibold">
                  {t.title}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <ColorDot color={t.colorKey} />
                  {t.column}
                </span>
              </td>
              <td className="px-4 py-2.5"><PriorityLabel priorityId={t.priorityId} priorities={board.priorities} /></td>
              <td className="px-4 py-2.5">
                {t.assignees.length ? (
                  <span className="flex items-center gap-2.5">
                    <AvatarStack names={t.assignees.map((x) => x.name)} />
                    <span className="truncate">{t.assignees[0].name}{t.assignees.length > 1 ? ` +${t.assignees.length - 1}` : ""}</span>
                  </span>
                ) : (
                  <span className="text-faint">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-2.5"><TagOverflow tags={t.tagIds.map((id) => board.tags.find((g) => g.id === id)).filter((g) => !!g)} /></td>
              <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground" title={new Date(t.createdAt).toLocaleString()}>{dateOf(t.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
