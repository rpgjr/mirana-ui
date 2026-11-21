import { useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { LuMail } from "react-icons/lu"

import { Button } from "@/components/common/button"
import { Input } from "@/components/common/input"
import { Label } from "@/components/common/form"

import { forgot } from "@/services/authService"
import { AuthLayout } from "@/layouts/AuthLayout"
import { FormError } from "@/components/common/feedback"
import { EMAIL_ERROR, EMAIL_RE } from "@/constants/validation"
import { errorText } from "@/utils/errorText"

export function ForgotPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const mutation = useMutation({
    mutationFn: forgot,
    onSuccess: () => navigate("/reset", { state: { email: email.trim().toLowerCase() } }),
    onError: (e) => setError(errorText(e)),
  })

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    setError("")
    if (!EMAIL_RE.test(email.trim())) {
      setError(EMAIL_ERROR)
      return
    }
    mutation.mutate({ email: email.trim() })
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we send a code to set a new password."
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormError message={error} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 text-base"
          />
        </div>
        <Button type="submit" size="lg" disabled={mutation.isPending || !email} className="h-11 text-sm">
          <LuMail data-icon="inline-start" />
          {mutation.isPending ? "Sending code" : "Send reset code"}
        </Button>
      </form>
    </AuthLayout>
  )
}
