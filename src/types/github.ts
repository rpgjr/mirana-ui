export interface GithubInstallation {
  installationId: number
  login: string
  type: string
  repoSelection: string
  manageUrl: string
}

export interface GithubStatus {
  enabled: boolean
  connectUrl: string | null
  installUrl: string | null
  installations: GithubInstallation[]
}

export interface GithubRepo {
  fullName: string
  description: string
  isPrivate: boolean
  installationId: number
  projectSlug: string | null
}

export interface GithubPull {
  number: number
  title: string
  state: string
  merged: boolean
  draft: boolean
  author: string
  url: string
  updatedAt: string
  ticketKeys: string[]
}
