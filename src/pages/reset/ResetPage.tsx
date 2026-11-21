import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/common/button"
import { Label } from "@/components/common/form"
import { ApiError } from "@/services/apiClient"

import { reset } from "@/services/authService"
import { AuthLayout } from "@/layouts/AuthLayout"
import { OtpInput } from "@/components/common/input"
import { PasswordField } from "@/components/common/input"
import { passwordChecks } from "@/utils/passwordRules"
import { FormError } from "@/components/common/feedback"
import { errorText } from "@/utils/errorText"

export function ResetPage() {
  const state = useLocation().state as { email: string } | null
  const navigate = useNavigate()
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [fieldError, setFieldError] = useState("")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: reset,
    onSuccess: () => {
      toast.success("Password changed. Sign in with your new password.")
      navigate("/login", { replace: true })
    },
    onError: (e) => {
      if (e instanceof ApiError && e.fields.password) setFieldError(e.fields.password)
      else setError(errorText(e))
    },
  })

  if (!state?.email) return <Navigate to="/forgot" replace />

  const c = passwordChecks(password, state.email)
  const ready = code.length === 6 && c.length && c.common && c.email

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    setError("")
    setFieldError("")
    mutation.mutate({ email: state.email, code, newPassword: password })
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={
        <>
          Enter the code sent to <span className="font-mono text-foreground">{state.email}</span>.
        </>
      }
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <FormError message={error} />
        <div className="flex flex-col gap-1.5">
          <Label>Code</Label>
          <OtpInput value={code} onChange={setCode} invalid={!!error} disabled={mutation.isPending} />
        </div>
        <PasswordField label="New password" value={password} onChange={setPassword} email={state.email} error={fieldError} showRules autoComplete="new-password" />
        <Button type="submit" size="lg" disabled={!ready || mutation.isPending} className="h-11 text-sm">
          {mutation.isPending ? "Saving" : "Change password"}
        </Button>
      </form>
    </AuthLayout>
  )
}
