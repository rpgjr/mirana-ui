import { Link } from "react-router-dom"

import type { Board } from "@/types/project"
import { Avatar } from "@/components/common/tile"
import { KeyChip } from "@/components/common/badge"
import { PrBadge } from "@/components/common/badge"
import { PriorityDot } from "@/components/common/badge"
import { PRIORITY_LABEL, TYPE_LABEL } from "@/constants/ticket"

export function ListView({ board, basePath }: { board: Board; basePath: string }) {
  const rows = board.columns.flatMap((c) => c.tickets.map((t) => ({ ...t, column: c.name })))
  if (rows.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">No tickets yet. Create the first one.</p>
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            <th className="px-4 py-2.5 font-medium">Key</th>
            <th className="px-4 py-2.5 font-medium">Title</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Priority</th>
            <th className="px-4 py-2.5 font-medium">PRs</th>
            <th className="px-4 py-2.5 font-medium">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.key} className="border-b border-border last:border-0 hover:bg-secondary/60">
              <td className="px-4 py-2.5"><KeyChip ticketKey={t.key} /></td>
              <td className="px-4 py-2.5">
                <Link to={`${basePath}/t/${t.key}`} className="font-medium hover:text-primary hover:underline">{t.title}</Link>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{TYPE_LABEL[t.type]}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{t.column}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><PriorityDot priority={t.priority} />{PRIORITY_LABEL[t.priority]}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs"><PrBadge count={t.prCount} state={t.prState} /></td>
              <td className="px-4 py-2.5">
                {t.assigneeName ? (
                  <span className="inline-flex items-center gap-2"><Avatar name={t.assigneeName} />{t.assigneeName}</span>
                ) : (
                  <span className="text-faint">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
