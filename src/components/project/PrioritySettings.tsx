import { useState, type FormEvent } from "react"
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2 } from "react-icons/lu"
import { toast } from "sonner"

import { PriorityLabel } from "@/components/common/badge"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { ColorPicker } from "@/components/common/select"
import { usePriorityMutations } from "@/hooks/useProjects"
import { ApiError } from "@/services/apiClient"
import { DEFAULT_COLOR } from "@/utils/color"
import type { PriorityConfig } from "@/types/project"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not save. Try again.")

function PriorityRow({ item, all, index, slug, owner }: { item: PriorityConfig; all: PriorityConfig[]; index: number; slug: string; owner: boolean }) {
  const { update, remove, reorder } = usePriorityMutations(slug)
  const [name, setName] = useState(item.name)
  const ids = all.map((p) => p.id)
  const commit = () => {
    const v = name.trim()
    if (!v) return setName(item.name)
    if (v !== item.name) update.mutate({ id: item.id, name: v }, { onError: (e) => { setName(item.name); fail(e) } })
  }
  const move = (by: number) => {
    const next = [...ids]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    reorder.mutate(next, { onError: fail })
  }
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2.5">
      <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground">{index + 1}</span>
      <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} maxLength={20} disabled={!owner} aria-label={`Name of priority ${item.name}`} className="h-9 min-w-36 flex-1 font-medium" />
      {owner && <ColorPicker value={item.color} label={`Color of ${item.name}`} onChange={(c) => update.mutate({ id: item.id, color: c }, { onError: fail })} />}
      <span className="w-24"><PriorityLabel priorityId={item.id} priorities={all} /></span>
      {owner && (
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0 || reorder.isPending} onClick={() => move(-1)} aria-label={`Move ${item.name} up`}><LuArrowUp /></Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={index === all.length - 1 || reorder.isPending} onClick={() => move(1)} aria-label={`Move ${item.name} down`}><LuArrowDown /></Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={all.length <= 1 || remove.isPending} onClick={() => remove.mutate(item.id, { onError: fail })} aria-label={`Remove ${item.name}`} className="text-destructive hover:text-destructive"><LuTrash2 /></Button>
        </div>
      )}
    </li>
  )
}

export function PrioritySettings({ slug, priorities, owner }: { slug: string; priorities: PriorityConfig[]; owner: boolean }) {
  const { add } = usePriorityMutations(slug)
  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_COLOR)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    add.mutate({ name: name.trim(), color }, { onSuccess: () => setName(""), onError: fail })
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {priorities.map((p, i) => <PriorityRow key={p.id} item={p} all={priorities} index={i} slug={slug} owner={owner} />)}
      </ul>
      {owner && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="New priority, for example Blocker" aria-label="New priority name" className="h-9 min-w-48 flex-1" />
          <ColorPicker value={color} label="Color of the new priority" onChange={setColor} />
          <Button type="submit" size="lg" disabled={!name.trim() || add.isPending} className="h-9">
            <LuPlus data-icon="inline-start" />
            Add priority
          </Button>
        </form>
      )}
      <p className="text-xs text-muted-foreground">From lowest to highest, top to bottom. Up to 8. New tickets start at the second one. A priority can be removed once no ticket uses it, and one always stays.</p>
    </div>
  )
}
