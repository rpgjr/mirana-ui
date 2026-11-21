import { useState, type FormEvent, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LuCircleCheck, LuLaptop, LuSmartphone, LuTrash2 } from "react-icons/lu"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/common/navigation"
import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { changePassword, getAccount, getDevices, removeDevice, renameAccount, signOutOthers } from "@/services/accountService"
import { describeDevice } from "@/utils/userAgent"
import { PasswordField } from "@/components/common/input"
import { passwordChecks } from "@/utils/passwordRules"
import { ME_KEY } from "@/hooks/useAuth"
import { timeAgo } from "@/utils/time"
import { ApiError } from "@/services/apiClient"

const ACCOUNT_KEY = ["account"] as const
const DEVICES_KEY = ["account", "devices"] as const

const fail = (e: unknown) => toast.error(e instanceof ApiError ? e.message : "Something went wrong. Try again.")

export function AccountPage() {
  const { data: account, isPending } = useQuery({ queryKey: ACCOUNT_KEY, queryFn: getAccount })
  if (isPending || !account) return <p className="text-sm text-muted-foreground">Loading account</p>
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Your profile, password and the browsers you have approved.</p>
      </div>
      <ProfileCard name={account.displayName} email={account.email} verified={account.emailVerified} since={account.createdAt} />
      <PasswordCard email={account.email} changedAt={account.passwordChangedAt} />
      <DevicesCard />
      <Section title="Appearance" description="Dark is the default. System follows your device.">
        <ThemeToggle />
      </Section>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
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

function ProfileCard({ name, email, verified, since }: { name: string; email: string; verified: boolean; since: string }) {
  const qc = useQueryClient()
  const [value, setValue] = useState(name)
  const [error, setError] = useState("")
  const save = useMutation({
    mutationFn: renameAccount,
    onSuccess: (a) => {
      qc.setQueryData(ACCOUNT_KEY, a)
      qc.invalidateQueries({ queryKey: ME_KEY })
      toast.success("Name updated")
    },
    onError: (e) => setError(e instanceof ApiError ? (Object.values(e.fields)[0] ?? e.message) : "Could not save your name."),
  })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError("")
    save.mutate(value)
  }
  return (
    <Section title="Profile">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acct-name">Name</Label>
          <Input id="acct-name" value={value} onChange={(e) => setValue(e.target.value)} maxLength={100} className="h-10" aria-invalid={!!error} />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="acct-email">Email</Label>
          <Input id="acct-email" value={email} readOnly className="h-10 font-mono text-muted-foreground" />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {verified && <LuCircleCheck className="size-3.5 text-success" aria-hidden="true" />}
            {verified ? "Verified" : "Not verified"} · member since {new Date(since).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
        </div>
        <Button type="submit" size="lg" disabled={save.isPending || !value.trim() || value.trim() === name} className="h-10 self-start">
          {save.isPending ? "Saving" : "Save name"}
        </Button>
      </form>
    </Section>
  )
}

function PasswordCard({ email, changedAt }: { email: string; changedAt: string | null }) {
  const qc = useQueryClient()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const c = passwordChecks(next, email)
  const ready = current && c.length && c.common && c.email

  const save = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed. Your other sessions were signed out.")
      setCurrent("")
      setNext("")
      qc.invalidateQueries({ queryKey: ACCOUNT_KEY })
    },
    onError: (e) => {
      if (e instanceof ApiError && Object.keys(e.fields).length) setErrors(e.fields)
      else fail(e)
    },
  })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    save.mutate({ currentPassword: current, newPassword: next })
  }
  return (
    <Section title="Password" description={changedAt ? `Last changed ${timeAgo(changedAt)}.` : undefined}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <PasswordField id="acct-current" label="Current password" value={current} onChange={setCurrent} error={errors.currentPassword} autoComplete="current-password" />
        <PasswordField id="acct-new" label="New password" value={next} onChange={setNext} email={email} error={errors.newPassword} showRules autoComplete="new-password" />
        <Button type="submit" size="lg" disabled={!ready || save.isPending} className="h-10 self-start">
          {save.isPending ? "Saving" : "Change password"}
        </Button>
      </form>
    </Section>
  )
}

function DevicesCard() {
  const qc = useQueryClient()
  const { data: devices } = useQuery({ queryKey: DEVICES_KEY, queryFn: getDevices })
  const remove = useMutation({
    mutationFn: removeDevice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DEVICES_KEY })
      toast.success("Device removed. It will ask for a code next time.")
    },
    onError: fail,
  })
  const others = useMutation({ mutationFn: signOutOthers, onSuccess: () => toast.success("Other sessions signed out."), onError: fail })

  return (
    <Section title="Approved devices" description="Browsers that passed an email code. Remove one and it asks for a new code the next time it signs in.">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {(devices ?? []).map((d) => {
          const Icon = /iPhone|Android/.test(d.userAgent ?? "") ? LuSmartphone : LuLaptop
          return (
            <li key={d.id} className="flex items-center gap-3 px-3.5 py-3">
              <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {describeDevice(d.userAgent)}
                  {d.current && <span className="rounded-full bg-success/15 px-2 py-0.5 font-mono text-[11px] font-normal text-success">this device</span>}
                </p>
                <p className="text-xs text-muted-foreground">Approved {timeAgo(d.createdAt)} · last seen {timeAgo(d.lastSeenAt)}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Remove ${describeDevice(d.userAgent)}`} disabled={remove.isPending} onClick={() => remove.mutate(d.id)}>
                <LuTrash2 />
              </Button>
            </li>
          )
        })}
        {devices?.length === 0 && <li className="px-3.5 py-4 text-sm text-muted-foreground">No approved devices.</li>}
      </ul>
      <Button variant="outline" size="lg" onClick={() => others.mutate()} disabled={others.isPending} className="h-10 self-start">
        Sign out my other sessions
      </Button>
    </Section>
  )
}
