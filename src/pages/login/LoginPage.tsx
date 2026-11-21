import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { LuLogIn } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"
import { ApiError } from "@/services/apiClient"

import { login } from "@/services/authService"
import { AuthLayout } from "@/layouts/AuthLayout"
import { PasswordField } from "@/components/common/input"
import { FormError } from "@/components/common/feedback"
import { EMAIL_ERROR, EMAIL_RE } from "@/constants/validation"
import { errorText } from "@/utils/errorText"
import { useMe, useSetUser } from "@/hooks/useAuth"

export function LoginPage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const setUser = useSetUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (out) => {
      const e = email.trim().toLowerCase()
      if (out.kind === "signedIn") {
        setUser(out.user)
        navigate("/", { replace: true })
      } else if (out.kind === "otp") {
        navigate("/verify", { state: { email: e, kind: "device" } })
      } else {
        navigate("/verify", { state: { email: e, kind: "signup" } })
      }
    },
    onError: (e) => setFormError(errorText(e instanceof ApiError ? e : e)),
  })

  if (user) return <Navigate to="/" replace />

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    setFormError("")
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(EMAIL_ERROR)
      return
    }
    mutation.mutate({ email: email.trim(), password })
  }

  return (
    <AuthLayout
      title="Welcome back"
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            aria-invalid={!!emailError}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError("")
            }}
            onBlur={() => email && !EMAIL_RE.test(email.trim()) && setEmailError(EMAIL_ERROR)}
            className="h-11 text-base"
          />
          {emailError && <p className="text-xs text-destructive">{emailError}</p>}
        </div>
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
        <div className="flex justify-end text-sm">
          <Link to="/forgot" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" disabled={mutation.isPending || !password || !email} className="h-11 text-sm">
          <LuLogIn data-icon="inline-start" />
          {mutation.isPending ? "Signing in" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  )
}
