import { useEffect, useRef } from "react"
import { Link, Navigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/common/button"
import { useGithubConnect } from "@/hooks/useGithub"
import { ApiError } from "@/services/apiClient"

/** GitHub sends the browser here with ?code and ?state. The code is single use, so it is spent exactly once. */
export function GithubCallbackPage() {
  const [params] = useSearchParams()
  const code = params.get("code")
  const state = params.get("state")
  const { mutate, isError, isSuccess, error } = useGithubConnect()
  const sent = useRef(false)

  useEffect(() => {
    if (!code || !state || sent.current) return
    sent.current = true
    mutate({ code, state })
  }, [code, state, mutate])

  if (!code || !state) return <Navigate to="/settings/github" replace />
  if (isSuccess) return <Navigate to="/settings/github" replace />

  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-3 pt-10">
      {isError ? (
        <>
          <h1 className="text-xl font-semibold">Could not connect GitHub</h1>
          <p className="text-sm text-muted-foreground">{error instanceof ApiError ? error.message : "Something went wrong. Try again."}</p>
          <Button size="lg" render={<Link to="/settings/github" />}>Back to GitHub settings</Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Connecting your GitHub account</p>
      )}
    </div>
  )
}
