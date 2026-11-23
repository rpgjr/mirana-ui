import { LuGithub, LuPlus } from "react-icons/lu"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { InstallationList, RepoTable } from "@/components/github"
import { useGithubDisconnect, useGithubRepos, useGithubStatus } from "@/hooks/useGithub"
import { ApiError } from "@/services/apiClient"

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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

export function GithubSettingsPage() {
  const { data: status, isPending, isError } = useGithubStatus()
  const connected = !!status?.installations.length
  const { data: repos, isPending: loadingRepos, isError: reposFailed } = useGithubRepos(connected)
  const disconnect = useGithubDisconnect()

  if (isPending) return <p className="text-sm text-muted-foreground">Loading GitHub settings</p>
  if (isError || !status) return <p className="text-sm text-destructive">Could not load GitHub settings. Refresh to try again.</p>

  if (!status.enabled) {
    return (
      <Section title="GitHub" description="GitHub connect is not set up on this server yet.">
        <p className="text-sm text-muted-foreground">Ask the person who runs Mirana to add the GitHub App settings. Pull request links from the webhook still work.</p>
      </Section>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Connected accounts"
        description="Your own GitHub account, or an organization you belong to. Mirana only sees repositories you give the App access to."
      >
        {connected ? (
          <>
            <InstallationList
              items={status.installations}
              removing={disconnect.isPending}
              onRemove={(id) =>
                disconnect.mutate(id, {
                  onSuccess: () => toast.success("Disconnected from Mirana. The App stays installed on GitHub until you remove it there."),
                  onError: (e) => toast.error(e instanceof ApiError ? e.message : "Could not disconnect."),
                })
              }
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="lg" render={<a href={status.installUrl ?? "#"} />}>
                <LuPlus data-icon="inline-start" />
                Add another account
              </Button>
              <Button variant="ghost" size="lg" render={<a href={status.connectUrl ?? "#"} />}>
                Refresh from GitHub
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to pick repositories for your projects and see their pull requests next to your tickets.
            </p>
            <Button size="lg" className="h-10" render={<a href={status.connectUrl ?? "#"} />}>
              <LuGithub data-icon="inline-start" />
              Connect GitHub
            </Button>
            <p className="text-xs text-muted-foreground">
              Not installed yet? <a className="underline" href={status.installUrl ?? "#"}>Install the Mirana App</a> first, then connect.
            </p>
          </div>
        )}
      </Section>

      {connected && (
        <Section title="Repositories" description="Open one to see its recent pull requests and the tickets they mention.">
          {loadingRepos && <p className="text-sm text-muted-foreground">Loading repositories</p>}
          {reposFailed && <p className="text-sm text-destructive">Could not read repositories from GitHub.</p>}
          {repos && !repos.length && <p className="text-sm text-muted-foreground">The App has no repositories yet. Add some under Manage on GitHub.</p>}
          {repos && repos.length > 0 && <RepoTable repos={repos} />}
        </Section>
      )}
    </div>
  )
}
