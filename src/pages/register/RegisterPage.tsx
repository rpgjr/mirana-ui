import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { LuMail } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { ApiError } from "@/services/apiClient"

import { register } from "@/services/authService"
import { AuthLayout } from "@/layouts/AuthLayout"
import { PasswordField } from "@/components/common/input"
import { passwordChecks } from "@/utils/passwordRules"
import { FormError } from "@/components/common/feedback"
import { EMAIL_ERROR, EMAIL_RE } from "@/constants/validation"
import { errorText } from "@/utils/errorText"
import { useMe } from "@/hooks/useAuth"

export function RegisterPage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate("/verify", { state: { email: email.trim().toLowerCase(), kind: "signup" } }),
    onError: (e) => {
      if (e instanceof ApiError && Object.keys(e.fields).length > 0) setErrors(e.fields)
      else setFormError(errorText(e))
    },
  })

  if (user) return <Navigate to="/" replace />

  const checks = passwordChecks(password, email)
  const ready = name.trim() && EMAIL_RE.test(email.trim()) && checks.length && checks.common && checks.email

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    setFormError("")
    setErrors({})
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: EMAIL_ERROR })
      return
    }
    mutation.mutate({ email: email.trim(), password, displayName: name.trim() })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="We email a 6 digit code to confirm it is a real inbox."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} className="h-11 text-base" />
          {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            aria-invalid={!!errors.email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((x) => ({ ...x, email: "" }))
            }}
            onBlur={() => email && !EMAIL_RE.test(email.trim()) && setErrors((x) => ({ ...x, email: EMAIL_ERROR }))}
            className="h-11 text-base"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <PasswordField value={password} onChange={setPassword} email={email} error={errors.password} showRules autoComplete="new-password" />
        <Button type="submit" size="lg" disabled={mutation.isPending || !ready} className="h-11 text-sm">
          <LuMail data-icon="inline-start" />
          {mutation.isPending ? "Sending code" : "Send verification code"}
        </Button>
      </form>
    </AuthLayout>
  )
}
