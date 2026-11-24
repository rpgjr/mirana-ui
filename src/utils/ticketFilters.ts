import type { Board, TicketCard } from "@/types/project"

export interface TicketFilterState {
  q: string
  assignee: string[] // member ids, or "none" for unassigned
  priority: string[]
  tag: string[] // tag ids
}

export const NO_FILTERS: TicketFilterState = { q: "", assignee: [], priority: [], tag: [] }

const LIST_KEYS = ["assignee", "priority", "tag"] as const

export function readFilters(params: URLSearchParams): TicketFilterState {
  const f: TicketFilterState = { ...NO_FILTERS, q: params.get("q") ?? "" }
  for (const k of LIST_KEYS) f[k] = (params.get(k) ?? "").split(",").filter(Boolean)
  return f
}

/** Writes only the filters that are set, so the address stays short and can be shared. */
export function writeFilters(params: URLSearchParams, f: TicketFilterState): URLSearchParams {
  const next = new URLSearchParams(params)
  if (f.q.trim()) next.set("q", f.q)
  else next.delete("q")
  for (const k of LIST_KEYS) {
    if (f[k].length) next.set(k, f[k].join(","))
    else next.delete(k)
  }
  return next
}

export const isFiltering = (f: TicketFilterState) => !!f.q.trim() || LIST_KEYS.some((k) => f[k].length > 0)

/** A key such as FT-1, ft-001 or FT-00001 matches the same ticket. Anything else matches the title or the key text. */
function matchesText(t: TicketCard, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  if (t.title.toLowerCase().includes(needle) || t.key.toLowerCase().includes(needle)) return true
  const m = /^([a-z]+)-?(\d+)$/.exec(needle)
  if (m) {
    const [prefix, digits] = t.key.toLowerCase().split("-")
    return prefix === m[1] && Number(digits) === Number(m[2])
  }
  return false
}

export function matchesTicket(t: TicketCard, f: TicketFilterState): boolean {
  if (!matchesText(t, f.q)) return false
  if (f.assignee.length) {
    const ids = t.assignees.length ? t.assignees.map((a) => String(a.id)) : ["none"]
    if (!ids.some((id) => f.assignee.includes(id))) return false
  }
  if (f.priority.length && !f.priority.includes(String(t.priorityId))) return false
  if (f.tag.length && !t.tagIds.some((id) => f.tag.includes(String(id)))) return false
  return true
}

export function filterBoard(board: Board, f: TicketFilterState): Board {
  if (!isFiltering(f)) return board
  return { ...board, columns: board.columns.map((c) => ({ ...c, tickets: c.tickets.filter((t) => matchesTicket(t, f)) })) }
}

export const countTickets = (board: Board) => board.columns.reduce((n, c) => n + c.tickets.length, 0)
