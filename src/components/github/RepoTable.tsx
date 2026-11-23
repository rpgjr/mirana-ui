import { useState } from "react"
import { Link } from "react-router-dom"
import { LuChevronDown, LuChevronRight, LuLock } from "react-icons/lu"

import { RepoPulls } from "@/components/github/RepoPulls"
import type { GithubRepo } from "@/types/github"

export function RepoTable({ repos }: { repos: GithubRepo[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {repos.map((r) => {
        const expanded = open === r.fullName
        const Chevron = expanded ? LuChevronDown : LuChevronRight
        return (
          <li key={r.fullName}>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : r.fullName)}
                aria-expanded={expanded}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Chevron className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate font-mono text-sm">{r.fullName}</span>
                {r.isPrivate && <LuLock className="size-3.5 shrink-0 text-muted-foreground" aria-label="Private" />}
              </button>
              {r.projectSlug ? (
                <Link to={`/projects/${r.projectSlug}`} className="rounded-md bg-secondary px-2 py-0.5 text-xs hover:bg-secondary/70">
                  In {r.projectSlug}
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">Not in a project</span>
              )}
            </div>
            {r.description && !expanded && <p className="-mt-1.5 truncate px-10 pb-3 text-xs text-muted-foreground">{r.description}</p>}
            {expanded && (
              <div className="border-t border-border bg-background/40">
                <RepoPulls repo={r.fullName} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
