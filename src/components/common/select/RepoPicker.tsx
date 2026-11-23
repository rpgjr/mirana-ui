import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Textarea } from "@/components/common/input"
import { MultiSelect } from "@/components/common/select"
import { useGithubRepos, useGithubStatus } from "@/hooks/useGithub"

interface Props {
  value: string[]
  onChange: (value: string[]) => void
  /** Slug of the project being edited. Its own repositories stay selectable. */
  ownSlug?: string
  id?: string
  onLeave?: () => void
}

/** Picks repositories from the user's connected GitHub accounts. Falls back to a text box only when the server has no GitHub connect. */
export function RepoPicker({ value, onChange, ownSlug, id, onLeave }: Props) {
  const { data: github, isPending } = useGithubStatus()
  const connected = !!github?.installations.length
  const { data: repos, isPending: loading } = useGithubRepos(connected)
  const [text, setText] = useState(value.join("\n"))

  const options = useMemo(() => {
    const list = (repos ?? []).map((r) => ({
      value: r.fullName.toLowerCase(),
      hint: r.projectSlug && r.projectSlug !== ownSlug ? `In ${r.projectSlug}` : undefined,
      disabled: !!r.projectSlug && r.projectSlug !== ownSlug,
    }))
    // Keep repositories that are already on the project selectable even when GitHub no longer lists them.
    const known = new Set(list.map((o) => o.value))
    return [...list, ...value.filter((v) => !known.has(v)).map((v) => ({ value: v, hint: undefined, disabled: false }))]
  }, [repos, value, ownSlug])

  if (isPending) return <p className="text-sm text-muted-foreground">Loading</p>

  if (!github?.enabled) {
    return (
      <>
        <Textarea
          id={id}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onChange(e.target.value.split(/[\s,]+/).filter(Boolean))
          }}
          rows={3}
          className="font-mono"
          placeholder={"rpgjr/hophop\nrpgjr/hophop-ui"}
        />
        <p className="text-xs text-muted-foreground">One per line. A project can cover a backend and a frontend repository.</p>
      </>
    )
  }

  if (!connected) {
    return (
      <p className="rounded-lg border border-border bg-card/60 px-3 py-2.5 text-sm text-muted-foreground">
        Connect your GitHub account to pick repositories.{" "}
        <Link to="/settings/github" onClick={onLeave} className="text-foreground underline underline-offset-2">
          Open GitHub settings
        </Link>
      </p>
    )
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading your repositories</p>

  return (
    <>
      <MultiSelect id={id} placeholder="Select repositories" max={10} value={value} onChange={onChange} options={options} />
      <p className="text-xs text-muted-foreground">A project can cover a backend and a frontend repository. Repos already in another project are greyed out.</p>
    </>
  )
}
