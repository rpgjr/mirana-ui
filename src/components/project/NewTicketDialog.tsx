import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { Dropdown, MultiSelect } from "@/components/common/select"
import { AssigneePicker } from "./AssigneePicker"
import { ColorDot, TagChip } from "@/components/common/badge"
import { Button } from "@/components/common/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/common/modal"
import { Input } from "@/components/common/input"
import { Label, MarkdownEditor } from "@/components/common/form"
import { ApiError } from "@/services/apiClient"
import { cn } from "@/utils/cn"

import type { Board } from "@/types/project"
import { useCreateTicket } from "@/hooks/useProjects"


export function NewTicketDialog({ board, open, onOpenChange, onCreated }: {
  board: Board
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (key: string) => void
}) {
  const slug = board.project.slug
  const create = useCreateTicket(slug)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  // Medium is the second priority by default, so new tickets start there unless the project reordered them.
  const [priority, setPriority] = useState("")
  const [assignees, setAssignees] = useState<number[]>([])
  const [columnId, setColumnId] = useState("")
  const [tagNames, setTagNames] = useState<string[]>([])
  const [error, setError] = useState("")

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    setError("")
    create.mutate(
      {
        title,
        description,
        priorityId: Number(chosenPriority) || undefined,
        assigneeIds: assignees,
        columnId: columnId ? Number(columnId) : undefined,
        tagIds: board.tags.filter((t) => tagNames.includes(t.name)).map((t) => t.id),
      },
      {
        onSuccess: (t) => {
          toast.success(`Created ${t.key}`)
          onOpenChange(false)
          setTitle("")
          setDescription("")
          setTagNames([])
          setAssignees([])
          onCreated(t.key)
        },
        onError: (err) => setError(err instanceof ApiError ? (Object.values(err.fields)[0] ?? err.message) : "Could not create the ticket."),
      },
    )
  }

  const priorityOptions = board.priorities.map((p) => ({ value: String(p.id), label: p.name, icon: <ColorDot color={p.color} /> }))
  const chosenPriority = priority || String(board.priorities[Math.min(1, board.priorities.length - 1)]?.id ?? "")
  const canCreate = !!title.trim() && !create.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="gap-1.5 border-b border-border px-7 py-5 pr-14 sm:px-8">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            New ticket
            <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">{board.project.name}</span>
          </DialogTitle>
          <DialogDescription>Each ticket gets the next number in the project. Use tags to say what kind it is.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="thin-scroll grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
            <div className="thin-scroll flex min-w-0 flex-col gap-6 p-7 sm:p-8 lg:min-h-0 lg:overflow-y-auto">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-title" className="text-sm font-semibold">Title</Label>
                <Input id="ticket-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus className="h-12 px-4 text-base font-medium" placeholder="What needs to happen?" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-desc" className="text-sm font-semibold">Description</Label>
                <MarkdownEditor id="ticket-desc" value={description} onChange={setDescription} rows={10} placeholder="Context, steps, links and images. Markdown works." onSubmit={() => canCreate && submit()} />
              </div>
            </div>

            <aside className="thin-scroll flex flex-col gap-5 border-t border-border bg-card/50 p-7 sm:p-8 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l">
              <h3 className="text-sm font-semibold">Properties</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-priority" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Priority</Label>
                <Dropdown id="ticket-priority" value={chosenPriority} onChange={setPriority} options={priorityOptions} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-assignee" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Assignees</Label>
                <AssigneePicker id="ticket-assignee" members={board.members} value={assignees} onChange={setAssignees} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-column" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Column</Label>
                <Dropdown
                  id="ticket-column"
                  value={columnId}
                  onChange={setColumnId}
                  options={[
                    { value: "", label: board.columns[0]?.name ?? "Backlog", icon: <ColorDot color={board.columns[0]?.color ?? "#64748b"} /> },
                    ...board.columns.slice(1).map((c) => ({ value: String(c.id), label: c.name, icon: <ColorDot color={c.color} /> })),
                  ]}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-tags" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tags</Label>
                {board.tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags yet. Add them in project settings.</p>
                ) : (
                  <MultiSelect
                    id="ticket-tags"
                    placeholder="Add tags"
                    searchPlaceholder="Search tags"
                    max={8}
                    value={tagNames}
                    onChange={setTagNames}
                    options={board.tags.map((t) => ({ value: t.name, label: t.name, icon: <ColorDot color={t.color} /> }))}
                    renderChip={(name) => {
                      const tag = board.tags.find((t) => t.name === name)
                      return tag ? <TagChip tag={tag} /> : null
                    }}
                  />
                )}
              </div>
            </aside>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-7 py-4 sm:px-8">
            <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")} role={error ? "alert" : undefined}>
              {error || "Tip: press Cmd or Ctrl and Enter in the description to create."}
            </p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="lg" className="h-10 px-4" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" size="lg" disabled={!canCreate} className="h-10 px-6">
                {create.isPending ? "Creating" : "Create ticket"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
