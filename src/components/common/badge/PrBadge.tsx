import { LuGitPullRequest } from "react-icons/lu"

import { cn } from "@/utils/cn"

const PR_STYLE = { OPEN: "text-success", MERGED: "text-[#a47cf0] dark:text-[#c4a5ff]", CLOSED: "text-destructive" }

export function PrBadge({ count, state }: { count: number; state: "OPEN" | "CLOSED" | "MERGED" | null }) {
  if (!count) return null
  return (
    <span className={cn("inline-flex items-center gap-1", PR_STYLE[state ?? "OPEN"])} title={`${count} pull request${count > 1 ? "s" : ""}, latest ${state?.toLowerCase()}`}>
      <LuGitPullRequest className="size-3" aria-hidden="true" />
      {count}
    </span>
  )
}
