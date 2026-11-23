import { api } from "@/services/apiClient"
import type { GithubInstallation, GithubPull, GithubRepo, GithubStatus } from "@/types/github"

export const getGithubStatus = async () => (await api.get<GithubStatus>("/api/github/status")).data
export const connectGithub = async (b: { code: string; state: string }) =>
  (await api.post<GithubInstallation[]>("/api/github/connect", b)).data
export const disconnectGithub = (installationId: number) => api.delete(`/api/github/installations/${installationId}`)
export const getGithubRepos = async () => (await api.get<GithubRepo[]>("/api/github/repos")).data
export const getGithubPulls = async (repo: string) =>
  (await api.get<GithubPull[]>(`/api/github/pulls?repo=${encodeURIComponent(repo)}`)).data
