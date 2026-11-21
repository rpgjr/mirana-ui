export interface Account {
  id: number
  email: string
  displayName: string
  emailVerified: boolean
  createdAt: string
  passwordChangedAt: string | null
}

export interface Device {
  id: number
  userAgent: string | null
  createdAt: string
  lastSeenAt: string
  current: boolean
}
