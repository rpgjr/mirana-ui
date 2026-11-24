import { useState, type FormEvent } from "react"
import { LuPlus, LuTrash2 } from "react-icons/lu"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { ColorPicker } from "@/components/common/select"
import { useTagMutations } from "@/hooks/useProjects"
import { ApiError } from "@/services/apiClient"
import { DEFAULT_COLOR } from "@/utils/color"
import type { Tag } from "@/types/project"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not save. Try again.")

function TagRow({ tag, slug, owner }: { tag: Tag; slug: string; owner: boolean }) {
  const { update, remove } = useTagMutations(slug)
  const [name, setName] = useState(tag.name)
  const save = () => {
    const v = name.trim()
    if (!v) return setName(tag.name)
    if (v !== tag.name) update.mutate({ id: tag.id, name: v }, { onError: (e) => { setName(tag.name); fail(e) } })
  }
  return (
    <li className="flex flex-wrap items-center gap-3 px-3 py-2.5">
      <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} maxLength={30} disabled={!owner} aria-label={`Name of tag ${tag.name}`} className="h-9 min-w-40 flex-1" />
      {owner && (
        <>
          <ColorPicker value={tag.color} label={`Color of ${tag.name}`} onChange={(c) => update.mutate({ id: tag.id, color: c }, { onError: fail })} />
          <Button type="button" variant="ghost" size="icon-sm" disabled={remove.isPending} onClick={() => remove.mutate(tag.id, { onError: fail })} aria-label={`Remove tag ${tag.name}`} className="text-destructive hover:text-destructive">
            <LuTrash2 />
          </Button>
        </>
      )}
    </li>
  )
}

export function TagSettings({ slug, tags, owner }: { slug: string; tags: Tag[]; owner: boolean }) {
  const { add } = useTagMutations(slug)
  const [name, setName] = useState("")
  const [color, setColor] = useState(DEFAULT_COLOR)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    add.mutate({ name: name.trim(), color }, { onSuccess: () => setName(""), onError: fail })
  }
  return (
    <div className="flex flex-col gap-4">
      {tags.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {tags.map((t) => <TagRow key={t.id} tag={t} slug={slug} owner={owner} />)}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No tags yet.</p>
      )}
      {owner && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="New tag, for example frontend" aria-label="New tag name" className="h-9 min-w-48 flex-1" />
          <ColorPicker value={color} label="Color of the new tag" onChange={setColor} />
          <Button type="submit" size="lg" disabled={!name.trim() || add.isPending} className="h-9">
            <LuPlus data-icon="inline-start" />
            Add tag
          </Button>
        </form>
      )}
      <p className="text-xs text-muted-foreground">Up to 30 tags per project and 8 per ticket. Removing a tag removes it from every ticket.</p>
    </div>
  )
}
