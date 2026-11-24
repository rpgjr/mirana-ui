import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { LuArrowLeft } from "react-icons/lu"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Label } from "@/components/common/form"
import { Input } from "@/components/common/input"
import { Dropdown, RepoPicker } from "@/components/common/select"
import { ColumnSettings, PrioritySettings, TagSettings } from "@/components/project"
import { useBoard, useProjectSettings } from "@/hooks/useProjects"
import { ApiError } from "@/services/apiClient"
import type { TicketFormat } from "@/types/project"

const fail = (e: unknown) => toast.error(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not save. Try again.")

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm sm:p-6">
      <header>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

export function ProjectSettingsPage() {
  const { slug = "" } = useParams()
  const { data: board, isPending, error } = useBoard(slug)
  const { rename, setRepos, setFormat } = useProjectSettings(slug)
  const [name, setName] = useState("")
  const [repos, setRepoList] = useState<string[]>([])
  const [format, setFormatState] = useState<TicketFormat | null>(null)

  const project = board?.project
  useEffect(() => {
    if (project) {
      setName(project.name)
      setRepoList(project.repos)
    }
  }, [project])
  const savedFormat = board?.format
  useEffect(() => {
    if (savedFormat) setFormatState(savedFormat)
  }, [savedFormat])

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/" replace />
  if (isPending) return <p className="text-sm text-muted-foreground">Loading settings</p>
  if (error || !project || !format) return <p className="text-sm text-destructive">Could not load this project. Try again.</p>

  const owner = project.role === "OWNER"
  const sameRepos = repos.length === project.repos.length && repos.every((r) => project.repos.includes(r))

  const saveName = (e: FormEvent) => {
    e.preventDefault()
    rename.mutate(name, { onSuccess: () => toast.success("Project renamed"), onError: fail })
  }
  const formatChanged = JSON.stringify(format) !== JSON.stringify(board?.format)
  const saveFormat = (e: FormEvent) => {
    e.preventDefault()
    setFormat.mutate(format, { onSuccess: () => toast.success("Ticket IDs updated. Existing tickets were renamed."), onError: fail })
  }
  const pad = (n: number) => String(n).padStart(format.digits, "0")
  const saveRepos = (e: FormEvent) => {
    e.preventDefault()
    setRepos.mutate(repos, { onSuccess: () => toast.success("Repositories updated"), onError: fail })
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link to={`/projects/${slug}`} className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <LuArrowLeft className="size-4" aria-hidden="true" />
          Back to board
        </Link>
        <h1 className="text-xl font-semibold">{project.name} settings</h1>
        {!owner && <p className="text-sm text-muted-foreground">Only the project owner can change these.</p>}
      </div>

      <Section title="General" description="The name shows in the sidebar and on the board. Ticket keys and links stay the same.">
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} disabled={!owner} className="h-10" />
          </div>
          <Button type="submit" size="lg" disabled={!owner || rename.isPending || !name.trim() || name.trim() === project.name} className="h-10 self-start">
            {rename.isPending ? "Saving" : "Save name"}
          </Button>
        </form>
      </Section>

      <Section title="Board columns" description="The stages on your board, left to right. Rename them, change the dot color, reorder or add your own.">
        <ColumnSettings slug={slug} columns={board?.columns ?? []} owner={owner} />
      </Section>

      <Section title="Priorities" description="Your own priority levels, shown on every ticket as text with its color. Rename, recolor, reorder, add or remove them.">
        <PrioritySettings slug={slug} priorities={board?.priorities ?? []} owner={owner} />
      </Section>

      <Section title="Tags" description="Labels you can put on tickets, for example frontend, api or design.">
        <TagSettings slug={slug} tags={board?.tags ?? []} owner={owner} />
      </Section>

      <Section title="Ticket IDs" description="How ticket keys are written. The key is also the branch name, so a ticket FT-00001 uses the branch FT-00001.">
        <form onSubmit={saveFormat} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fmt-prefix">Prefix</Label>
              <Input
                id="fmt-prefix"
                value={format.prefix}
                onChange={(e) => setFormatState({ ...format, prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                maxLength={6}
                disabled={!owner}
                className="h-10 font-mono"
                aria-invalid={!!(setFormat.error instanceof ApiError && setFormat.error.fields.prefix)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fmt-digits">Digits</Label>
              <Dropdown
                id="fmt-digits"
                value={String(format.digits)}
                disabled={!owner}
                onChange={(v) => setFormatState({ ...format, digits: Number(v) })}
                options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: String(n) }))}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Preview: <span className="font-mono text-foreground">{`${format.prefix || "??"}-${pad(1)}`}   {`${format.prefix || "??"}-${pad(2)}`}   {`${format.prefix || "??"}-${pad(3)}`}</span>
          </p>
          {setFormat.error instanceof ApiError && (
            <p className="text-sm text-destructive">{Object.values(setFormat.error.fields)[0] ?? setFormat.error.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            The prefix is 2 to 6 letters or digits. Saving renames every existing ticket, and the numbers stay. Branches and pull requests that use an old key stop linking.
          </p>
          {owner && (
            <Button type="submit" size="lg" disabled={!formatChanged || setFormat.isPending || format.prefix.length < 2} className="h-10 self-start">
              {setFormat.isPending ? "Saving" : "Save ticket IDs"}
            </Button>
          )}
        </form>
      </Section>

      <Section title="GitHub repositories" description="Pull requests from these repositories link to this project's tickets. Name a branch like the ticket key, for example FT-00001.">
        <form onSubmit={saveRepos} className="flex flex-col gap-4">
          {owner ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-repos">Repositories</Label>
              <RepoPicker id="project-repos" value={repos} onChange={setRepoList} ownSlug={slug} />
            </div>
          ) : (
            <ul className="flex flex-col gap-1 font-mono text-sm text-muted-foreground">
              {project.repos.length ? project.repos.map((r) => <li key={r}>{r}</li>) : <li>None connected.</li>}
            </ul>
          )}
          {owner && (
            <Button type="submit" size="lg" disabled={setRepos.isPending || sameRepos} className="h-10 self-start">
              {setRepos.isPending ? "Saving" : "Save repositories"}
            </Button>
          )}
        </form>
      </Section>
    </div>
  )
}
