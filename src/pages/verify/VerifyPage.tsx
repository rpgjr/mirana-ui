import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/common/button"

import { resend, verifyDevice, verifyEmail } from "@/services/authService"
import { AuthLayout } from "@/layouts/AuthLayout"
import { OtpInput } from "@/components/common/input"
import { FormError } from "@/components/common/feedback"
import { errorText } from "@/utils/errorText"
import { useCountdown } from "@/hooks/useCountdown"
import { useSetUser } from "@/hooks/useAuth"

interface VerifyState {
  email: string
  kind: "signup" | "device"
}

export function VerifyPage() {
  const state = useLocation().state as VerifyState | null
  const navigate = useNavigate()
  const setUser = useSetUser()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const { left, restart } = useCountdown(60)

  const verify = useMutation({
    mutationFn: (c: string) => (state?.kind === "device" ? verifyDevice : verifyEmail)({ email: state!.email, code: c }),
    onSuccess: ({ data }) => {
      setUser(data)
      navigate("/", { replace: true })
    },
    onError: (e) => {
      setError(errorText(e))
      setCode("")
    },
  })

  const again = useMutation({
    mutationFn: () => resend({ email: state!.email, purpose: state!.kind === "device" ? "NEW_DEVICE" : "VERIFY_EMAIL" }),
    onSuccess: () => {
      restart()
      toast.success("If the account exists, a new code is on its way.")
    },
    onError: (e) => setError(errorText(e)),
  })

  if (!state?.email) return <Navigate to="/login" replace />

  const device = state.kind === "device"
  const submit = (c: string) => {
    setError("")
    verify.mutate(c)
  }

  return (
    <AuthLayout
      title={device ? "Approve this device" : "Check your email"}
      subtitle={
        <>
          We sent a 6 digit code to <span className="font-mono text-foreground">{state.email}</span>. It expires in 10 minutes.
        </>
      }
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length === 6) submit(code)
        }}
        className="flex flex-col gap-4"
      >
        <FormError message={error} />
        <OtpInput value={code} onChange={setCode} onComplete={submit} invalid={!!error} disabled={verify.isPending} />
        <Button type="submit" size="lg" disabled={code.length < 6 || verify.isPending} className="h-11 text-sm">
          {verify.isPending ? "Checking" : device ? "Approve and sign in" : "Verify and continue"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          {left > 0 ? (
            <span>Resend code in {left}s</span>
          ) : (
            <button type="button" onClick={() => again.mutate()} disabled={again.isPending} className="text-primary hover:underline">
              Resend code
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
