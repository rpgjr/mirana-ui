import { ApiError } from "@/services/apiClient"

export function errorText(e: unknown): string {
  return e instanceof ApiError ? e.message : "Something went wrong. Try again."
}
