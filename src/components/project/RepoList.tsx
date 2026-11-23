import { LuGitBranch } from "react-icons/lu"

/** Read-only list of the project's repositories. They are edited under the project's settings. */
export function RepoList({ repos }: { repos: string[] }) {
  if (!repos.length) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {repos.map((r) => (
        <a
          key={r}
          href={`https://github.com/${r}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <LuGitBranch className="size-3" aria-hidden="true" />
          {r}
        </a>
      ))}
    </div>
  )
}
