import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "@/services/projectService"
import type { Board, NewTicket, TicketCard, TicketDetail, TicketFormat, TicketPatch } from "@/types/project"

export const projectsKey = ["projects"] as const
export const boardKey = (slug: string) => ["board", slug] as const
export const ticketKey = (slug: string, key: string) => ["ticket", slug, key] as const

export const useProjects = () => useQuery({ queryKey: projectsKey, queryFn: api.listProjects })

export const useBoard = (slug: string) => useQuery({ queryKey: boardKey(slug), queryFn: () => api.getBoard(slug) })

export const useTicket = (slug: string, key: string | undefined) =>
  useQuery({ queryKey: ticketKey(slug, key ?? ""), queryFn: () => api.getTicket(slug, key!), enabled: !!key })

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.createProject, onSuccess: () => qc.invalidateQueries({ queryKey: projectsKey }) })
}

export function useProjectSettings(slug: string) {
  const qc = useQueryClient()
  const done = () => {
    qc.invalidateQueries({ queryKey: boardKey(slug) })
    qc.invalidateQueries({ queryKey: projectsKey })
    qc.invalidateQueries({ queryKey: ["github"] })
  }
  return {
    rename: useMutation({ mutationFn: (name: string) => api.renameProject(slug, name), onSuccess: done }),
    setFormat: useMutation({ mutationFn: (f: TicketFormat) => api.setTicketFormat(slug, f), onSuccess: done }),
    setRepos: useMutation({ mutationFn: (repos: string[]) => api.setRepos(slug, repos), onSuccess: done }),
  }
}

export function useCreateTicket(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (b: NewTicket) => api.createTicket(slug, b),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: boardKey(slug) })
      qc.invalidateQueries({ queryKey: projectsKey })
    },
  })
}

/** Moves optimistically so the card lands instantly, then reconciles with the server. */
export function useMoveTicket(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { key: string; columnId: number; position: number }) =>
      api.moveTicket(slug, v.key, { columnId: v.columnId, position: v.position }),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: boardKey(slug) })
      const prev = qc.getQueryData<Board>(boardKey(slug))
      if (prev) qc.setQueryData(boardKey(slug), applyMove(prev, v.key, v.columnId, v.position))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(boardKey(slug), ctx.prev),
    onSettled: (_d, _e, v) => {
      qc.invalidateQueries({ queryKey: boardKey(slug) })
      qc.invalidateQueries({ queryKey: ticketKey(slug, v.key) })
    },
  })
}

export function applyMove(board: Board, key: string, columnId: number, position: number): Board {
  let moving: TicketCard | undefined
  const stripped = board.columns.map((c) => ({
    ...c,
    tickets: c.tickets.filter((t) => {
      if (t.key === key) moving = t
      return t.key !== key
    }),
  }))
  if (!moving) return board
  return {
    ...board,
    columns: stripped.map((c) => {
      if (c.id !== columnId) return c
      const tickets = c.tickets.slice()
      tickets.splice(Math.max(0, Math.min(position, tickets.length)), 0, moving!)
      return { ...c, tickets }
    }),
  }
}

export function useTicketMutations(slug: string, key: string) {
  const qc = useQueryClient()
  const done = (data: TicketDetail) => {
    qc.setQueryData(ticketKey(slug, key), data)
    qc.invalidateQueries({ queryKey: boardKey(slug) })
  }
  return {
    patch: useMutation({ mutationFn: (b: TicketPatch) => api.patchTicket(slug, key, b), onSuccess: done }),
    comment: useMutation({ mutationFn: (body: string) => api.addComment(slug, key, body), onSuccess: done }),
    move: useMutation({
      mutationFn: (b: { columnId: number; position: number }) => api.moveTicket(slug, key, b),
      onSuccess: done,
    }),
  }
}
