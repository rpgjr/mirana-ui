import type { ReactNode } from "react"
import { LuCopy, LuExternalLink } from "react-icons/lu"
import { toast } from "sonner"

import { Button } from "@/components/common/button"

function Copy({ value, label }: { value: string; label: string }) {
  const copy = () =>
    navigator.clipboard.writeText(value).then(
      () => toast.success(`${label} copied`),
      () => toast.error("Copy failed. Select the text and copy it."),
    )
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 align-middle">
      <code className="truncate font-mono text-xs select-all">{value}</code>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`} className="shrink-0 text-muted-foreground hover:text-foreground">
        <LuCopy className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs">{n}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  )
}

const ENV = [
  ["MIRANA_GITHUB_APP_ID", "App ID, top of the App page"],
  ["MIRANA_GITHUB_APP_SLUG", "The last part of github.com/apps/<slug>"],
  ["MIRANA_GITHUB_CLIENT_ID", "Client ID, top of the App page"],
  ["MIRANA_GITHUB_CLIENT_SECRET", "From Generate a new client secret"],
  ["MIRANA_GITHUB_PRIVATE_KEY", "The .pem file, see the command below"],
  ["MIRANA_GITHUB_WEBHOOK_SECRET", "The webhook secret you typed in step 1"],
] as const

/** One time setup for whoever runs this Mirana. Users never see keys: they only click Connect GitHub. */
export function SetupGuide() {
  const origin = window.location.origin
  const callback = `${origin}/settings/github/callback`
  const webhook = `${origin}/api/github/webhook`
  const pemCommand = `awk 'NF {sub(/\\r/, ""); printf "%s\\\\n",$0;}' ~/Downloads/<your-key>.pem | pbcopy`
  return (
    <ol className="flex flex-col gap-5">
      <Step n={1} title="Create the GitHub App">
        <p>
          Open <a className="inline-flex items-center gap-1 underline" href="https://github.com/settings/apps/new" target="_blank" rel="noreferrer">GitHub, New GitHub App<LuExternalLink className="size-3" aria-hidden="true" /></a> and fill in:
        </p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>Name: Mirana, or anything unique.</li>
          <li>Homepage URL: <Copy value={origin} label="Homepage URL" /></li>
          <li>Callback URL: <Copy value={callback} label="Callback URL" /></li>
          <li>Tick <em>Request user authorization (OAuth) during installation</em>.</li>
          <li>Webhook, Active, URL: <Copy value={webhook} label="Webhook URL" /></li>
          <li>
            Webhook secret: run <code className="font-mono text-xs">openssl rand -hex 32</code> in a terminal and paste the result.
            Keep it, you need it in step 3.
          </li>
          <li>Repository permissions: Pull requests and Metadata, both Read-only.</li>
          <li>Subscribe to events: Pull request.</li>
          <li>Where can this App be installed: Any account, so every Mirana user can connect their own GitHub.</li>
        </ul>
      </Step>
      <Step n={2} title="Get the client secret and the private key">
        <p>On the new App page, click <em>Generate a new client secret</em> and copy it right away. It shows once.</p>
        <p>Under <em>Private keys</em>, click <em>Generate a private key</em>. A .pem file downloads. Turn it into one line:</p>
        <Copy value={pemCommand} label="Command" />
      </Step>
      <Step n={3} title="Add these to the server">
        <p>On Render, open the service, then Environment, and add them. Never paste them into Mirana or share them in chat.</p>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {ENV.map(([name, hint]) => (
            <li key={name} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
              <Copy value={name} label={name} />
              <span className="text-xs">{hint}</span>
            </li>
          ))}
        </ul>
        <p>Save. Render redeploys in a few minutes.</p>
      </Step>
      <Step n={4} title="Come back and connect">
        <p>Reload this page. When the server has the values, a Connect GitHub button appears here for you and every user.</p>
        <Button variant="outline" size="lg" className="self-start" onClick={() => window.location.reload()}>
          Reload this page
        </Button>
      </Step>
    </ol>
  )
}
