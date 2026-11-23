import { useState, type FormEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { Input, Textarea } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { MultiSelect } from "@/components/common/select"
import { useGithubRepos, useGithubStatus } from "@/hooks/useGithub"
import { ApiError } from "@/services/apiClient"

import { useCreateProject } from "@/hooks/useProjects"

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const create = useCreateProject()
  const [name, setName] = useState("")
  const [repo, setRepo] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const { data: github, isPending: statusPending } = useGithubStatus()
  const connected = !!github?.installations.length
  const { data: repos, isPending: reposPending } = useGithubRepos(connected)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    create.mutate(
      { name, repos: github?.enabled ? picked : repo.split(/[\s,]+/).filter(Boolean) },
      {
        onSuccess: (p) => {
          toast.success(`Created ${p.name}`)
          onOpenChange(false)
          setName("")
          setRepo("")
          setPicked([])
          navigate(`/projects/${p.slug}`)
        },
        onError: (err) => {
          if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields)
          else toast.error(err instanceof ApiError ? err.message : "Could not create the project.")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Each project has its own board and its own ticket numbers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Name" error={errors.name}>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus className="h-10" placeholder="hophop" />
          </Field>
          <Field label="GitHub repositories (optional)" error={errors.repos ?? errors[Object.keys(errors).find((k) => k.startsWith("repos")) ?? ""]}>
            {statusPending ? (
              <p className="text-sm text-muted-foreground">Loading</p>
            ) : !github?.enabled ? (
              <>
                <Textarea id="project-repo" value={repo} onChange={(e) => setRepo(e.target.value)} rows={3} className="font-mono" placeholder={"rpgjr/hophop\nrpgjr/hophop-ui"} />
                <p className="text-xs text-muted-foreground">One per line. A project can cover a backend and a frontend repository.</p>
              </>
            ) : !connected ? (
              <p className="rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm text-muted-foreground">
                Connect your GitHub account to pick repositories.{" "}
                <Link to="/settings/github" onClick={() => onOpenChange(false)} className="text-foreground underline underline-offset-2">
                  Open GitHub settings
                </Link>
              </p>
            ) : reposPending ? (
              <p className="text-sm text-muted-foreground">Loading your repositories</p>
            ) : (
              <>
                <MultiSelect
                  id="project-repo"
                  placeholder="Select repositories"
                  max={10}
                  value={picked}
                  onChange={setPicked}
                  options={(repos ?? []).map((r) => ({ value: r.fullName, hint: r.projectSlug ? `In ${r.projectSlug}` : undefined, disabled: !!r.projectSlug }))}
                />
                <p className="text-xs text-muted-foreground">A project can cover a backend and a frontend repository. Repos already in a project are greyed out.</p>
              </>
            )}
          </Field>
          <Button type="submit" size="lg" disabled={!name.trim() || create.isPending} className="h-10">
            {create.isPending ? "Creating" : "Create project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
