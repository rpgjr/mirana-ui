export type TicketType = "FEATURE" | "HOTFIX" | "BUGFIX"

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export interface ProjectSummary {
  id: number
  name: string
  slug: string
  repos: string[]
  role: string
  ticketCount: number
}

export interface Member {
  id: number
  displayName: string
  email: string
  role: string
}

export interface TicketCard {
  id: number
  key: string
  type: TicketType
  title: string
  priority: Priority
  assigneeId: number | null
  assigneeName: string | null
  prCount: number
  prState: "OPEN" | "CLOSED" | "MERGED" | null
  commentCount: number
}

export interface Column {
  id: number
  name: string
  status: string
  position: number
  tickets: TicketCard[]
}

export interface TicketFormat {
  digits: number
  featurePrefix: string
  hotfixPrefix: string
  bugfixPrefix: string
}

export interface Board {
  project: ProjectSummary
  columns: Column[]
  members: Member[]
  format: TicketFormat
}

export interface PrLink {
  id: number
  repo: string
  number: number
  branch: string | null
  title: string | null
  url: string | null
  state: "OPEN" | "CLOSED" | "MERGED"
}

export interface TicketDetail {
  id: number
  key: string
  type: TicketType
  title: string
  description: string | null
  priority: Priority
  columnId: number
  columnName: string
  status: string
  assigneeId: number | null
  assigneeName: string | null
  createdByName: string | null
  createdAt: string
  updatedAt: string
  pullRequests: PrLink[]
  comments: { id: number; authorId: number; authorName: string; body: string; createdAt: string }[]
  events: { id: number; actorType: string; actorName: string | null; type: string; detail: string | null; createdAt: string }[]
}

export interface NewTicket {
  type: TicketType
  title: string
  description?: string
  priority?: Priority
  assigneeId?: number | null
  columnId?: number
}

export interface TicketPatch {
  title?: string
  description?: string
  priority?: Priority
  assigneeId?: number
  clearAssignee?: boolean
}
