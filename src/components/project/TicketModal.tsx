import { useState, type FormEvent } from "react"
import { LuExternalLink, LuGitMerge, LuGitPullRequest, LuGitPullRequestClosed, LuPencil, LuSquareArrowOutUpRight } from "react-icons/lu"
import { toast } from "sonner"

import { Dropdown, MultiSelect } from "@/components/common/select"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label, Markdown, MarkdownEditor } from "@/components/common/form"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/common/modal"
import { ApiError } from "@/services/apiClient"
import { cn } from "@/utils/cn"

import type { Board, PrLink, TicketDetail } from "@/types/project"
import { useTicket, useTicketMutations } from "@/hooks/useProjects"
import { Avatar } from "@/components/common/tile"
import { ColorDot, KeyChip, TagChip } from "@/components/common/badge"
import { timeAgo } from "@/utils/time"
import { TicketActivity } from "./TicketActivity"
import { AssigneePicker } from "./AssigneePicker"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Something went wrong. Try again.")

export const ticketPagePath = (slug: string, key: string) => `/projects/${slug}/tickets/${key}`

export function TicketModal({ board, ticketKey, onClose }: { board: Board; ticketKey: string | undefined; onClose: () => void }) {
  const slug = board.project.slug
  const { data, isPending, isError } = useTicket(slug, ticketKey)
  return (
    <Dialog open={!!ticketKey} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[94dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1500px,96vw)]">
        <DialogTitle className="sr-only">{data ? `${data.key} ${data.title}` : "Ticket"}</DialogTitle>
        <DialogDescription className="sr-only">Ticket details, pull requests, comments and activity.</DialogDescription>
        {isPending && ticketKey && <p className="p-8 text-sm text-muted-foreground">Loading</p>}
        {isError && <p className="p-8 text-sm text-destructive">Could not load this ticket. It may have been removed.</p>}
        {data && ticketKey && <TicketBody key={data.key} board={board} ticket={data} showNewTab />}
      </DialogContent>
    </Dialog>
  )
}

type Tab = "details" | "activity"

export function TicketBody({ board, ticket, showNewTab }: { board: Board; ticket: TicketDetail; showNewTab?: boolean }) {
  const { patch, comment, move } = useTicketMutations(board.project.slug, ticket.key)
  const [tab, setTab] = useState<Tab>("details")
  const [title, setTitle] = useState(ticket.title)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(ticket.description ?? "")
  const [body, setBody] = useState("")

  const saveTitle = () => title.trim() && title !== ticket.title && patch.mutate({ title }, { onError: fail })
  const startEdit = () => {
    setDraft(ticket.description ?? "")
    setEditing(true)
  }
  const saveDescription = () =>
    patch.mutate({ description: draft }, { onSuccess: () => setEditing(false), onError: fail })

  const send = (e?: FormEvent) => {
    e?.preventDefault()
    if (!body.trim() || comment.isPending) return
    comment.mutate(body, { onSuccess: () => setBody(""), onError: fail })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-col gap-3 px-6 pt-6 pr-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <KeyChip ticketKey={ticket.key} className="text-xs" />
          <span className="text-xs text-muted-foreground">
            Created {timeAgo(ticket.createdAt)}
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
        <div role="tablist" aria-label="Ticket sections" className="-mb-px flex gap-1 border-b border-border">
          {(["details", "activity"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm text-muted-foreground capitalize hover:text-foreground", tab === t && "border-foreground font-semibold text-foreground")}
            >
              {t}
              {t === "activity" && <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[11px] text-foreground">{ticket.events.length}</span>}
              {t === "details" && ticket.comments.length > 0 && <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[11px] text-foreground">{ticket.comments.length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="thin-scroll flex min-w-0 flex-col gap-8 p-6 lg:min-h-0 lg:overflow-y-auto">
          {tab === "details" ? (
            <>
              <section aria-labelledby="desc" className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="desc" className="text-sm font-semibold">Description</h3>
                  {!editing && (
                    <Button type="button" variant="outline" size="sm" onClick={startEdit}>
                      <LuPencil data-icon="inline-start" />
                      Edit
                    </Button>
                  )}
                </div>
                {editing ? (
                  <>
                    <MarkdownEditor id="t-desc" value={draft} onChange={setDraft} rows={8} autoFocus placeholder="Add context, steps, links and images. Markdown works." onSubmit={saveDescription} />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="lg" className="h-9 text-destructive hover:text-destructive" onClick={() => setEditing(false)}>Cancel</Button>
                      <Button type="button" size="lg" className="h-9" disabled={patch.isPending} onClick={saveDescription}>{patch.isPending ? "Saving" : "Save description"}</Button>
                    </div>
                  </>
                ) : ticket.description?.trim() ? (
                  <div className="rounded-lg border border-border bg-card/60 px-4 py-3.5"><Markdown>{ticket.description}</Markdown></div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">No description yet. Use Edit to add context, steps, links and images.</p>
                )}
              </section>

              <section aria-labelledby="comments" className="flex flex-col gap-4">
                <h3 id="comments" className="text-sm font-semibold">Comments</h3>
                {ticket.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.authorName} />
                    <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/60 px-4 py-3">
                      <div className="mb-1.5 flex items-baseline gap-2 text-sm"><span className="font-semibold">{c.authorName}</span><span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span></div>
                      <Markdown>{c.body}</Markdown>
                    </div>
                  </div>
                ))}
                <form onSubmit={send} className="flex flex-col gap-2">
                  <Label htmlFor="t-comment" className="sr-only">Add a comment</Label>
                  <MarkdownEditor id="t-comment" value={body} onChange={setBody} rows={4} placeholder="Write a comment. Markdown works." onSubmit={() => send()} />
                  <Button type="submit" size="lg" disabled={!body.trim() || comment.isPending} className="h-9 self-end">Comment</Button>
                </form>
              </section>
            </>
          ) : (
            <>
              <TicketActivity board={board} ticket={ticket} />
            </>
          )}
        </div>

        <aside className="thin-scroll flex min-w-0 flex-col gap-5 border-t border-border p-6 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <Prop label="Status" id="t-status">
            <Dropdown
              id="t-status"
              value={String(ticket.columnId)}
              onChange={(v) => move.mutate({ columnId: Number(v), position: 0 }, { onError: fail })}
              options={board.columns.map((c) => ({ value: String(c.id), label: c.name, icon: <ColorDot color={c.color} /> }))}
            />
          </Prop>
          <Prop label="Priority" id="t-priority">
            <Dropdown
              id="t-priority"
              value={String(ticket.priorityId)}
              onChange={(v) => patch.mutate({ priorityId: Number(v) }, { onError: fail })}
              options={board.priorities.map((p) => ({ value: String(p.id), label: p.name, icon: <ColorDot color={p.color} /> }))}
            />
          </Prop>
          <Prop label="Tags" id="t-tags">
            {board.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet. Add them in project settings.</p>
            ) : (
              <MultiSelect
                id="t-tags"
                placeholder="Add tags"
                searchPlaceholder="Search tags"
                max={8}
                value={board.tags.filter((t) => ticket.tagIds.includes(t.id)).map((t) => t.name)}
                options={board.tags.map((t) => ({ value: t.name, label: t.name, icon: <ColorDot color={t.color} /> }))}
                renderChip={(name) => {
                  const tag = board.tags.find((t) => t.name === name)
                  return tag ? <TagChip tag={tag} /> : null
                }}
                onChange={(names) => patch.mutate({ tagIds: board.tags.filter((t) => names.includes(t.name)).map((t) => t.id) }, { onError: fail })}
              />
            )}
          </Prop>
          <Prop label="Assignees" id="t-assignee">
            <AssigneePicker id="t-assignee" members={board.members} value={ticket.assignees.map((a) => a.id)} onChange={(ids) => patch.mutate({ assigneeIds: ids }, { onError: fail })} />
          </Prop>

          <section aria-labelledby="prs" className="flex flex-col gap-2">
            <h3 id="prs" className="text-sm font-semibold">Pull requests</h3>
            {ticket.pullRequests.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                None yet. Name a branch <span className="font-mono text-foreground">{ticket.key}</span> and its pull request shows up here.
              </p>
            ) : (
              ticket.pullRequests.map((p) => <PrRow key={p.id} pr={p} />)
            )}
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
