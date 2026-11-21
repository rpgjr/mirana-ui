import { useQuery, useQueryClient } from "@tanstack/react-query"

import { me } from "@/services/authService"
import { type User } from "@/types/auth"

export const ME_KEY = ["me"] as const

export function useMe() {
  return useQuery({ queryKey: ME_KEY, queryFn: me, staleTime: 60_000, retry: false })
}

export function useSetUser() {
  const qc = useQueryClient()
  return (user: User | null) => qc.setQueryData(ME_KEY, user)
}
