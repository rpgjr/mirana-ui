import { useMemo } from "react"
import type { IconType } from "react-icons"
import { LuArrowRight, LuCirclePlus, LuFlag, LuGitBranch, LuGitCommitHorizontal, LuGitMerge, LuGitPullRequest, LuGitPullRequestClosed, LuGithub, LuLink, LuPencil, LuTag, LuUserRound } from "react-icons/lu"

import { ColorDot } from "@/components/common/badge"
import { Avatar } from "@/components/common/tile"
import { chipStyle } from "@/utils/color"
import { timeAgo } from "@/utils/time"
import type { Board, TicketDetail } from "@/types/project"

type Event = TicketDetail["events"][number]

const LOOK: Record<string, { icon: IconType; tone: string }> = {
  CREATED: { icon: LuCirclePlus, tone: "#22c55e" },
  MOVED: { icon: LuArrowRight, tone: "#3b82f6" },
  COMMIT: { icon: LuGitCommitHorizontal, tone: "#f59e0b" },
  PRIORITY_CHANGED: { icon: LuFlag, tone: "#f59e0b" },
  ASSIGNEES_CHANGED: { icon: LuUserRound, tone: "#ec4899" },
  ASSIGNED: { icon: LuUserRound, tone: "#ec4899" },
  UNASSIGNED: { icon: LuUserRound, tone: "#64748b" },
  TITLE_CHANGED: { icon: LuPencil, tone: "#64748b" },
  DESCRIPTION_CHANGED: { icon: LuPencil, tone: "#64748b" },
  TAGS_CHANGED: { icon: LuTag, tone: "#a855f7" },
  PR_LINKED: { icon: LuLink, tone: "#3b82f6" },
  PR_OPEN: { icon: LuGitPullRequest, tone: "#22c55e" },
  PR_MERGED: { icon: LuGitMerge, tone: "#a855f7" },
  PR_CLOSED: { icon: LuGitPullRequestClosed, tone: "#ef4444" },
}

export function describe(type: string, detail: string | null): string {
  switch (type) {
    case "CREATED": return "created this ticket"
    case "MOVED": return `moved it from ${detail}`
    case "COMMIT": return "pushed a commit"
    case "PRIORITY_CHANGED": return `changed the priority, ${detail?.toLowerCase()}`
    case "ASSIGNEES_CHANGED": return `changed the assignees: ${detail}`
    case "ASSIGNED": return `assigned it to ${detail}`
    case "UNASSIGNED": return "removed the assignee"
    case "TITLE_CHANGED": return "edited the title"
    case "DESCRIPTION_CHANGED": return "edited the description"
    case "TAGS_CHANGED": return "changed the tags"
    case "PR_LINKED": return "linked pull request"
    case "PR_OPEN": return "opened pull request"
    case "PR_MERGED": return "merged pull request"
    case "PR_CLOSED": return "closed pull request"
    default: return type.toLowerCase().replace(/_/g, " ")
  }
}

function Pill({ board, name }: { board: Board; name: string }) {
  const col = board.columns.find((c) => c.name === name)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground">
      <ColorDot color={col?.color ?? "#64748b"} />
      {name}
    </span>
  )
}

function Row({ board, e, last }: { board: Board; e: Event; last: boolean }) {
  const look = LOOK[e.type] ?? { icon: LuPencil, tone: "#64748b" }
  const Icon = look.icon
  const github = e.actorType === "GITHUB"
  const who = e.actorType === "CLAUDE" ? "Claude" : (e.actorName ?? "Someone")
  const [from, to] = e.type === "MOVED" && e.detail ? e.detail.split(" to ") : []
  const [sha, message, author] = e.type === "COMMIT" && e.detail ? e.detail.split("\t") : []
  const isPr = e.type.startsWith("PR_")
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && <span className="absolute top-11 bottom-0 left-5 w-px bg-border" aria-hidden="true" />}
      <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full" style={chipStyle(look.tone)}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            {github ? (
              <span className="inline-flex items-center gap-1.5 font-semibold"><LuGithub className="size-4" aria-hidden="true" />GitHub</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold"><Avatar name={who} className="size-5 text-[9px]" />{who}</span>
            )}
            {from && to ? (
              <span className="inline-flex flex-wrap items-center gap-1.5 text-muted-foreground">
                moved it from <Pill board={board} name={from} /> <LuArrowRight className="size-3.5" aria-hidden="true" /> <Pill board={board} name={to} />
              </span>
            ) : (
              <span className="text-muted-foreground">{describe(e.type, e.detail)}</span>
            )}
          </div>
          <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString()} className="shrink-0 text-right text-xs text-muted-foreground">
            {new Date(e.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · {timeAgo(e.createdAt)}
          </time>
        </div>
        {e.repo && (
          <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
            <LuGithub className="size-3.5" aria-hidden="true" />
            <span className="font-semibold text-foreground">{e.repo}</span>
            {e.branch && (
              <span className="inline-flex items-center gap-1"><LuGitBranch className="size-3.5" aria-hidden="true" />{e.branch}</span>
            )}
          </p>
        )}
        {sha && (
          <p className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            {e.url ? (
              <a href={e.url} target="_blank" rel="noreferrer" className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs underline-offset-2 hover:underline">{sha}</a>
            ) : (
              <code className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs">{sha}</code>
            )}
            <span className="min-w-0 truncate font-medium">{message}</span>
            {author && <span className="text-xs text-muted-foreground">by {author}</span>}
          </p>
        )}
        {isPr && e.detail && (
          e.url ? (
            <a href={e.url} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 font-mono text-xs underline-offset-2 hover:underline">{e.detail}</a>
          ) : (
            <p className="mt-2 inline-block rounded-md bg-secondary px-2 py-0.5 font-mono text-xs">{e.detail}</p>
          )
        )}
      </div>
    </li>
  )
}

/** One timeline for everything that happened to a ticket: pull requests, commits, status moves and edits, newest first. */
export function TicketActivity({ board, ticket }: { board: Board; ticket: TicketDetail }) {
  const days = useMemo(() => {
    const groups: { label: string; events: Event[] }[] = []
    ticket.events.forEach((e) => {
      const label = new Date(e.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      const last = groups[groups.length - 1]
      if (last?.label === label) last.events.push(e)
      else groups.push({ label, events: [e] })
    })
    return groups
  }, [ticket.events])

  if (days.length === 0) return <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">Nothing has happened yet.</p>

  return (
    <div className="flex flex-col gap-8">
      {days.map((d) => (
        <section key={d.label} className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{d.label}</h3>
          <ol className="flex flex-col">
            {d.events.map((e, i) => <Row key={e.id} board={board} e={e} last={i === d.events.length - 1} />)}
          </ol>
        </section>
      ))}
    </div>
  )
}
