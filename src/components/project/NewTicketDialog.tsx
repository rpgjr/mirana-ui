import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { NativeSelect } from "@/components/common/select"
import { Button } from "@/components/common/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/common/modal"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { Textarea } from "@/components/common/input"
import { ApiError } from "@/services/apiClient"
import { cn } from "@/utils/cn"

import type { Board, Priority, TicketType } from "@/types/project"
import { useCreateTicket } from "@/hooks/useProjects"
import { PRIORITIES, PRIORITY_LABEL, TYPE_LABEL } from "@/constants/ticket"

const TYPES: { value: TicketType; prefix: string; style: string }[] = [
  { value: "FEATURE", prefix: "FT", style: "data-[on=true]:border-ft data-[on=true]:bg-ft/10 data-[on=true]:text-ft" },
  { value: "HOTFIX", prefix: "HF", style: "data-[on=true]:border-hf data-[on=true]:bg-hf/10 data-[on=true]:text-hf" },
  { value: "BUGFIX", prefix: "BUG", style: "data-[on=true]:border-bug data-[on=true]:bg-bug/10 data-[on=true]:text-bug" },
]

export function NewTicketDialog({ board, open, onOpenChange, onCreated }: {
  board: Board
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (key: string) => void
}) {
  const slug = board.project.slug
  const create = useCreateTicket(slug)
  const [type, setType] = useState<TicketType>("FEATURE")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [assignee, setAssignee] = useState("")
  const [columnId, setColumnId] = useState("")
  const [error, setError] = useState("")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    create.mutate(
      {
        type,
        title,
        description,
        priority,
        assigneeId: assignee ? Number(assignee) : null,
        columnId: columnId ? Number(columnId) : undefined,
      },
      {
        onSuccess: (t) => {
          toast.success(`Created ${t.key}`)
          onOpenChange(false)
          setTitle("")
          setDescription("")
          onCreated(t.key)
        },
        onError: (err) => setError(err instanceof ApiError ? (Object.values(err.fields)[0] ?? err.message) : "Could not create the ticket."),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New ticket in {board.project.name}</DialogTitle>
          <DialogDescription>The key comes from the type and counts up per project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Ticket type" className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={type === t.value}
                data-on={type === t.value}
                onClick={() => setType(t.value)}
                className={cn("flex h-11 flex-col items-center justify-center rounded-lg border border-input text-xs text-muted-foreground transition-colors hover:text-foreground", t.style)}
              >
                <span className="font-medium">{TYPE_LABEL[t.value]}</span>
                <span className="font-mono text-[10px] opacity-80">{t.prefix}-</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-title">Title</Label>
            <Input id="ticket-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} autoFocus className="h-10" placeholder="What needs to happen?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-desc">Description</Label>
            <Textarea id="ticket-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Context, steps, links" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-priority">Priority</Label>
              <NativeSelect id="ticket-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-assignee">Assignee</Label>
              <NativeSelect id="ticket-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {board.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.displayName}</option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-column">Column</Label>
              <NativeSelect id="ticket-column" value={columnId} onChange={(e) => setColumnId(e.target.value)}>
                <option value="">Backlog</option>
                {board.columns.slice(1).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={!title.trim() || create.isPending} className="h-10">
            {create.isPending ? "Creating" : "Create ticket"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
