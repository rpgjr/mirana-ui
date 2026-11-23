import { LuGitMerge, LuGitPullRequest, LuGitPullRequestClosed, LuGitPullRequestDraft } from "react-icons/lu"

import { KeyChip } from "@/components/common/badge"
import { useGithubPulls } from "@/hooks/useGithub"
import { timeAgo } from "@/utils/time"
import type { GithubPull } from "@/types/github"

function PullIcon({ pr }: { pr: GithubPull }) {
  if (pr.merged) return <LuGitMerge className="size-4 text-hf" aria-label="Merged" />
  if (pr.state === "closed") return <LuGitPullRequestClosed className="size-4 text-bug" aria-label="Closed" />
  if (pr.draft) return <LuGitPullRequestDraft className="size-4 text-muted-foreground" aria-label="Draft" />
  return <LuGitPullRequest className="size-4 text-success" aria-label="Open" />
}

export function RepoPulls({ repo }: { repo: string }) {
  const { data, isPending, isError } = useGithubPulls(repo)
  if (isPending) return <p className="px-4 py-3 text-sm text-muted-foreground">Loading pull requests</p>
  if (isError) return <p className="px-4 py-3 text-sm text-destructive">Could not read pull requests from GitHub.</p>
  if (!data.length) return <p className="px-4 py-3 text-sm text-muted-foreground">No pull requests yet.</p>
  return (
    <ul className="divide-y divide-border">
      {data.map((pr) => (
        <li key={pr.number} className="flex items-start gap-3 px-4 py-2.5">
          <span className="mt-0.5"><PullIcon pr={pr} /></span>
          <div className="min-w-0 flex-1">
            <a href={pr.url} target="_blank" rel="noreferrer" className="text-sm hover:underline">{pr.title}</a>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono">#{pr.number}</span>
              <span>{pr.author}</span>
              <span>{timeAgo(pr.updatedAt)}</span>
              {pr.ticketKeys.map((k) => <KeyChip key={k} ticketKey={k} />)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
