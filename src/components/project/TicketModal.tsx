import { useState, type FormEvent } from "react"
import { LuExternalLink, LuGitMerge, LuGitPullRequest, LuGitPullRequestClosed, LuSquareArrowOutUpRight } from "react-icons/lu"
import { toast } from "sonner"

import { NativeSelect } from "@/components/common/select"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/common/modal"
import { Textarea } from "@/components/common/input"
import { ApiError } from "@/services/apiClient"
import { cn } from "@/utils/cn"

import type { Board, Priority, PrLink, TicketDetail } from "@/types/project"
import { useTicket, useTicketMutations } from "@/hooks/useProjects"
import { Avatar } from "@/components/common/tile"
import { KeyChip } from "@/components/common/badge"
import { PRIORITIES, PRIORITY_LABEL, TYPE_LABEL } from "@/constants/ticket"
import { timeAgo } from "@/utils/time"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Something went wrong. Try again.")

export const ticketPagePath = (slug: string, key: string) => `/projects/${slug}/tickets/${key}`

export function TicketModal({ board, ticketKey, onClose }: { board: Board; ticketKey: string | undefined; onClose: () => void }) {
  const slug = board.project.slug
  const { data, isPending, isError } = useTicket(slug, ticketKey)
  return (
    <Dialog open={!!ticketKey} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] gap-0 overflow-y-auto p-0 sm:max-w-5xl lg:max-w-6xl">
        <DialogTitle className="sr-only">{data ? `${data.key} ${data.title}` : "Ticket"}</DialogTitle>
        <DialogDescription className="sr-only">Ticket details, pull requests, comments and activity.</DialogDescription>
        {isPending && ticketKey && <p className="p-8 text-sm text-muted-foreground">Loading</p>}
        {isError && <p className="p-8 text-sm text-destructive">Could not load this ticket. It may have been removed.</p>}
        {data && ticketKey && <TicketBody key={data.key} board={board} ticket={data} showNewTab />}
      </DialogContent>
    </Dialog>
  )
}

export function TicketBody({ board, ticket, showNewTab }: { board: Board; ticket: TicketDetail; showNewTab?: boolean }) {
  const { patch, comment, move } = useTicketMutations(board.project.slug, ticket.key)
  const [title, setTitle] = useState(ticket.title)
  const [description, setDescription] = useState(ticket.description ?? "")
  const [body, setBody] = useState("")

  const saveTitle = () => title.trim() && title !== ticket.title && patch.mutate({ title }, { onError: fail })
  const saveDescription = () => description !== (ticket.description ?? "") && patch.mutate({ description }, { onError: fail })

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    comment.mutate(body, { onSuccess: () => setBody(""), onError: fail })
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-8 sm:p-7">
      <div className="flex flex-col gap-3 pr-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <KeyChip ticketKey={ticket.key} className="text-xs" />
          <span className="text-xs text-muted-foreground">
            {TYPE_LABEL[ticket.type]} · created {timeAgo(ticket.createdAt)}
            {ticket.createdByName ? ` by ${ticket.createdByName}` : ""}
          </span>
          {showNewTab && (
            <a
              href={ticketPagePath(board.project.slug, ticket.key)}
              target="_blank"
              rel="noopener"
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LuSquareArrowOutUpRight className="size-3.5" aria-hidden="true" />
              Open in new tab
            </a>
          )}
        </div>
        <Input
          aria-label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          maxLength={200}
          className="h-auto border-transparent bg-transparent px-1 py-1 text-2xl font-semibold hover:border-input focus-visible:bg-card dark:bg-transparent"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={saveDescription} rows={6} placeholder="Add context, steps and links" />
          </div>

          <section aria-labelledby="prs" className="flex flex-col gap-2">
            <h3 id="prs" className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Pull requests</h3>
            {ticket.pullRequests.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                None yet. Name a branch <span className="font-mono text-foreground">{ticket.key}-short-name</span> and its pull request shows up here.
              </p>
            ) : (
              ticket.pullRequests.map((p) => <PrRow key={p.id} pr={p} />)
            )}
          </section>

          <section aria-labelledby="comments" className="flex flex-col gap-3">
            <h3 id="comments" className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Comments</h3>
            {ticket.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.authorName} />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex items-baseline gap-2"><span className="font-medium">{c.authorName}</span><span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span></div>
                  <p className="whitespace-pre-wrap text-foreground/90">{c.body}</p>
                </div>
              </div>
            ))}
            <form onSubmit={send} className="flex flex-col gap-2">
              <Label htmlFor="t-comment" className="sr-only">Add a comment</Label>
              <Textarea id="t-comment" value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Write a comment" />
              <Button type="submit" size="lg" disabled={!body.trim() || comment.isPending} className="h-9 self-end">Comment</Button>
            </form>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 lg:border-l lg:border-border lg:pl-6">
          <Prop label="Status" id="t-status">
            <NativeSelect id="t-status" value={ticket.columnId} onChange={(e) => move.mutate({ columnId: Number(e.target.value), position: 0 }, { onError: fail })}>
              {board.columns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </NativeSelect>
          </Prop>
          <Prop label="Priority" id="t-priority">
            <NativeSelect id="t-priority" value={ticket.priority} onChange={(e) => patch.mutate({ priority: e.target.value as Priority }, { onError: fail })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
              ))}
            </NativeSelect>
          </Prop>
          <Prop label="Assignee" id="t-assignee">
            <NativeSelect
              id="t-assignee"
              value={ticket.assigneeId ?? ""}
              onChange={(e) => patch.mutate(e.target.value ? { assigneeId: Number(e.target.value) } : { clearAssignee: true }, { onError: fail })}
            >
              <option value="">Unassigned</option>
              {board.members.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </NativeSelect>
          </Prop>

          <section aria-labelledby="activity" className="flex flex-col gap-2">
            <h3 id="activity" className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Activity</h3>
            <ol className="flex flex-col gap-2 border-l border-border pl-4 text-sm text-muted-foreground">
              {ticket.events.map((e) => (
                <li key={e.id}>
                  <span className="text-foreground">{e.actorType === "GITHUB" ? "GitHub" : e.actorType === "CLAUDE" ? "Claude" : (e.actorName ?? "Someone")}</span>{" "}
                  {describe(e.type, e.detail)} · {timeAgo(e.createdAt)}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Prop({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

const PR_ICON = { OPEN: LuGitPullRequest, MERGED: LuGitMerge, CLOSED: LuGitPullRequestClosed }
const PR_TONE = { OPEN: "text-success", MERGED: "text-[#a47cf0] dark:text-[#c4a5ff]", CLOSED: "text-destructive" }

function PrRow({ pr }: { pr: PrLink }) {
  const Icon = PR_ICON[pr.state]
  return (
    <a
      href={pr.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-input"
    >
      <Icon className={cn("size-[18px]", PR_TONE[pr.state])} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{pr.title ?? `Pull request #${pr.number}`}</span>
        <span className="block truncate font-mono text-[11px] text-muted-foreground">#{pr.number} · {pr.branch}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 font-mono text-[11px]", pr.state === "OPEN" ? "bg-success/15 text-success" : pr.state === "MERGED" ? "bg-[#a47cf0]/15 text-[#a47cf0] dark:text-[#c4a5ff]" : "bg-destructive/15 text-destructive")}>
          {pr.state.toLowerCase()}
        </span>
        <LuExternalLink className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </span>
    </a>
  )
}

function describe(type: string, detail: string | null): string {
  switch (type) {
    case "CREATED": return "created this ticket"
    case "MOVED": return `moved it from ${detail?.replace(" to ", " to ")}`
    case "PRIORITY_CHANGED": return `changed priority, ${detail?.toLowerCase()}`
    case "ASSIGNED": return `assigned it to ${detail}`
    case "UNASSIGNED": return "removed the assignee"
    case "TITLE_CHANGED": return "edited the title"
    case "DESCRIPTION_CHANGED": return "edited the description"
    case "PR_OPEN": return `opened pull request ${detail}`
    case "PR_MERGED": return `merged pull request ${detail}`
    case "PR_CLOSED": return `closed pull request ${detail}`
    default: return type.toLowerCase().replace(/_/g, " ")
  }
}
