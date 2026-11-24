import { useState, type FormEvent } from "react"
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from "react-icons/lu"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { ColorPicker } from "@/components/common/select"
import { DEFAULT_COLOR, dotStyle } from "@/utils/color"
import { useColumnMutations } from "@/hooks/useProjects"
import { ApiError } from "@/services/apiClient"
import type { Column } from "@/types/project"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not save. Try again.")

function ColumnRow({ column, index, ids, slug, owner }: { column: Column; index: number; ids: number[]; slug: string; owner: boolean }) {
  const count = ids.length
  const { update, remove, reorder } = useColumnMutations(slug)
  const [name, setName] = useState(column.name)
  const required = column.status === "BACKLOG" || column.status === "DONE"
  const move = (by: number) => {
    const next = [...ids]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    reorder.mutate(next, { onError: fail })
  }
  const save = () => {
    const v = name.trim()
    if (!v) return setName(column.name)
    if (v !== column.name) update.mutate({ id: column.id, name: v }, { onError: (e) => { setName(column.name); fail(e) } })
  }
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2.5">
      <span className="size-3 shrink-0 rounded-full" style={dotStyle(column.color)} aria-hidden="true" />
      <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())} maxLength={40} disabled={!owner} aria-label={`Name of column ${column.name}`} className="h-9 min-w-40 flex-1 font-medium" />
      {owner && (
        <>
          <ColorPicker value={column.color} label={`Color of ${column.name}`} onChange={(c) => update.mutate({ id: column.id, color: c }, { onError: fail })} />
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0 || reorder.isPending} onClick={() => move(-1)} aria-label={`Move ${column.name} up`}><LuArrowUp /></Button>
            <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1 || reorder.isPending} onClick={() => move(1)} aria-label={`Move ${column.name} down`}><LuArrowDown /></Button>
            <Button type="button" variant="ghost" size="icon-sm" disabled={required || remove.isPending} title={required ? "Backlog and Done are required" : "Remove column"} onClick={() => remove.mutate(column.id, { onError: fail })} aria-label={`Remove ${column.name}`} className="text-destructive hover:text-destructive">
              <LuTrash2 />
            </Button>
          </div>
        </>
      )}
    </li>
  )
}

export function ColumnSettings({ slug, columns, owner }: { slug: string; columns: Column[]; owner: boolean }) {
  const { add } = useColumnMutations(slug)
  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_COLOR)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    add.mutate({ name: name.trim(), color }, { onSuccess: () => setName(""), onError: fail })
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {columns.map((c, i) => <ColumnRow key={c.id} column={c} index={i} ids={columns.map((x) => x.id)} slug={slug} owner={owner} />)}
      </ul>
      {owner && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="New column, for example QA" aria-label="New column name" className="h-9 min-w-48 flex-1" />
          <ColorPicker value={color} label="Color of the new column" onChange={setColor} />
          <Button type="submit" size="lg" disabled={!name.trim() || add.isPending} className="h-9">
            <LuPlus data-icon="inline-start" />
            Add column
          </Button>
        </form>
      )}
      <p className="text-xs text-muted-foreground">New columns go just before Done. A column can be removed once it has no tickets. Backlog and Done always stay.</p>
    </div>
  )
}
