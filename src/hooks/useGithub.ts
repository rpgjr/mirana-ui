import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "@/services/githubService"

export const githubKey = ["github"] as const

export const useGithubStatus = () => useQuery({ queryKey: [...githubKey, "status"], queryFn: api.getGithubStatus })

export const useGithubRepos = (enabled: boolean) =>
  useQuery({ queryKey: [...githubKey, "repos"], queryFn: api.getGithubRepos, enabled, staleTime: 60_000 })

export const useGithubPulls = (repo: string | null) =>
  useQuery({ queryKey: [...githubKey, "pulls", repo], queryFn: () => api.getGithubPulls(repo!), enabled: !!repo })

export function useGithubConnect() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.connectGithub, onSuccess: () => qc.invalidateQueries({ queryKey: githubKey }) })
}

export function useGithubDisconnect() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.disconnectGithub, onSuccess: () => qc.invalidateQueries({ queryKey: githubKey }) })
}
