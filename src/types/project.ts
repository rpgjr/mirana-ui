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
  title: string
  priorityId: number
  assignees: { id: number; name: string }[]
  prCount: number
  prState: "OPEN" | "CLOSED" | "MERGED" | null
  commentCount: number
  tagIds: number[]
  createdAt: string
}

export interface Column {
  id: number
  name: string
  status: string
  color: string
  position: number
  tickets: TicketCard[]
}

export interface TicketFormat {
  digits: number
  prefix: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface PriorityConfig {
  id: number
  name: string
  color: string
}

export interface Board {
  project: ProjectSummary
  columns: Column[]
  members: Member[]
  format: TicketFormat
  tags: Tag[]
  priorities: PriorityConfig[]
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
  title: string
  description: string | null
  priorityId: number
  columnId: number
  columnName: string
  status: string
  assignees: { id: number; name: string }[]
  createdByName: string | null
  createdAt: string
  updatedAt: string
  pullRequests: PrLink[]
  comments: { id: number; authorId: number; authorName: string; body: string; createdAt: string }[]
  events: { id: number; actorType: string; actorName: string | null; type: string; detail: string | null; createdAt: string; repo: string | null; branch: string | null; url: string | null }[]
  tagIds: number[]
}

export interface NewTicket {
  title: string
  description?: string
  priorityId?: number
  assigneeIds?: number[]
  columnId?: number
  tagIds?: number[]
}

export interface TicketPatch {
  title?: string
  description?: string
  priorityId?: number
  assigneeIds?: number[]
  tagIds?: number[]
}
