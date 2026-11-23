import { useState, type FormEvent, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { RepoPicker } from "@/components/common/select"
import { ApiError } from "@/services/apiClient"

import { useCreateProject } from "@/hooks/useProjects"

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const create = useCreateProject()
  const [name, setName] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    create.mutate(
      { name, repos: picked },
      {
        onSuccess: (p) => {
          toast.success(`Created ${p.name}`)
          onOpenChange(false)
          setName("")
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
            <RepoPicker id="project-repo" value={picked} onChange={setPicked} onLeave={() => onOpenChange(false)} />
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
