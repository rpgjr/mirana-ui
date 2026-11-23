import { LuBuilding2, LuExternalLink, LuUserRound } from "react-icons/lu"

import { Button } from "@/components/common/button"
import type { GithubInstallation } from "@/types/github"

export function InstallationList({ items, onRemove, removing }: { items: GithubInstallation[]; onRemove: (id: number) => void; removing: boolean }) {
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {items.map((i) => {
        const Icon = i.type === "Organization" ? LuBuilding2 : LuUserRound
        return (
          <li key={i.installationId} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{i.login}</div>
              <div className="text-xs text-muted-foreground">
                {i.type === "Organization" ? "Organization" : "Personal account"} · {i.repoSelection === "all" ? "All repositories" : "Selected repositories"}
              </div>
            </div>
            <Button variant="outline" size="sm" render={<a href={i.manageUrl} target="_blank" rel="noreferrer" />}>
              Manage on GitHub
              <LuExternalLink data-icon="inline-end" />
            </Button>
            <Button variant="ghost" size="sm" disabled={removing} onClick={() => onRemove(i.installationId)} aria-label={`Disconnect ${i.login}`}>
              Disconnect
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
