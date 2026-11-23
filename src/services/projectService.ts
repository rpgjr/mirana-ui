import { api } from "@/services/apiClient"
import type { Board, NewTicket, ProjectSummary, TicketDetail, TicketFormat, TicketPatch } from "@/types/project"

export const listProjects = async () => (await api.get<ProjectSummary[]>("/api/projects")).data
export const createProject = async (b: { name: string; repos: string[] }) =>
  (await api.post<ProjectSummary>("/api/projects", b)).data
export const renameProject = async (slug: string, name: string) =>
  (await api.patch<ProjectSummary>(`/api/projects/${slug}`, { name })).data
export const setTicketFormat = async (slug: string, f: TicketFormat) =>
  (await api.put<TicketFormat>(`/api/projects/${slug}/ticket-format`, f)).data
export const setRepos = async (slug: string, repos: string[]) =>
  (await api.put<string[]>(`/api/projects/${slug}/repos`, { repos })).data
export const addRepo = async (slug: string, repo: string) =>
  (await api.post<string[]>(`/api/projects/${slug}/repos`, { repo })).data
export const removeRepo = async (slug: string, repo: string) =>
  (await api.delete<string[]>(`/api/projects/${slug}/repos?repo=${encodeURIComponent(repo)}`)).data
export const getBoard = async (slug: string) => (await api.get<Board>(`/api/projects/${slug}/board`)).data
export const getTicket = async (slug: string, key: string) =>
  (await api.get<TicketDetail>(`/api/projects/${slug}/tickets/${key}`)).data

export const createTicket = async (slug: string, b: NewTicket) =>
  (await api.post<TicketDetail>(`/api/projects/${slug}/tickets`, b)).data

export const moveTicket = async (slug: string, key: string, b: { columnId: number; position: number }) =>
  (await api.post<TicketDetail>(`/api/projects/${slug}/tickets/${key}/move`, b)).data

export const patchTicket = async (slug: string, key: string, b: TicketPatch) =>
  (await api.patch<TicketDetail>(`/api/projects/${slug}/tickets/${key}`, b)).data

export const addComment = async (slug: string, key: string, body: string) =>
  (await api.post<TicketDetail>(`/api/projects/${slug}/tickets/${key}/comments`, { body })).data
