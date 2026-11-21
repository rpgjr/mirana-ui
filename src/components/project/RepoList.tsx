import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { LuGitBranch, LuPlus, LuX } from "react-icons/lu"

import { Input } from "@/components/common/input"
import { useRepoMutations } from "@/hooks/useProjects"
import { ApiError } from "@/services/apiClient"

export function RepoList({ slug, repos, canEdit }: { slug: string; repos: string[]; canEdit: boolean }) {
  const { add, remove } = useRepoMutations(slug)
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState("")

  const fail = (e: unknown) => toast.error(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not update repositories.")

  const submit = (e: FormEvent) => {
    e.preventDefault()
    add.mutate(value.trim(), {
      onSuccess: () => {
        setValue("")
        setAdding(false)
      },
      onError: fail,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {repos.map((r) => (
        <span key={r} className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground">
          <LuGitBranch className="size-3" aria-hidden="true" />
          <a href={`https://github.com/${r}`} target="_blank" rel="noreferrer" className="hover:text-foreground">{r}</a>
          {canEdit && (
            <button type="button" aria-label={`Remove ${r}`} onClick={() => remove.mutate(r, { onError: fail })} className="hover:text-destructive">
              <LuX className="size-3" aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
      {canEdit && !adding && (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground">
          <LuPlus className="size-3" aria-hidden="true" />
          {repos.length ? "Add repository" : "Connect a GitHub repository"}
        </button>
      )}
      {canEdit && adding && (
        <form onSubmit={submit} className="flex items-center gap-1.5">
          <Input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="owner/repo" aria-label="Repository" className="h-7 w-48 font-mono text-xs" />
        </form>
      )}
    </div>
  )
}
