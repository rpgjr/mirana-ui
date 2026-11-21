import { api, ApiError } from "@/services/apiClient"
import type { LoginOutcome, OtpPurpose, User } from "@/types/auth"

export const me = async (): Promise<User | null> => {
  try {
    return (await api.get<User>("/api/auth/me")).data
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null
    throw e
  }
}

export const register = (b: { email: string; password: string; displayName: string }) =>
  api.post<{ code: string }>("/api/auth/register", b)

export const verifyEmail = (b: { email: string; code: string }) => api.post<User>("/api/auth/verify", b)

export async function login(b: { email: string; password: string }): Promise<LoginOutcome> {
  try {
    const res = await api.post<User | { code: string }>("/api/auth/login", b)
    if (res.status === 202) return { kind: "otp" }
    return { kind: "signedIn", user: res.data as User }
  } catch (e) {
    if (e instanceof ApiError && e.code === "EMAIL_NOT_VERIFIED") return { kind: "unverified" }
    throw e
  }
}

export const verifyDevice = (b: { email: string; code: string }) => api.post<User>("/api/auth/login/verify", b)

export const resend = (b: { email: string; purpose: OtpPurpose | "RESET_PASSWORD" }) => api.post("/api/auth/resend", b)

export const forgot = (b: { email: string }) => api.post("/api/auth/forgot", b)

export const reset = (b: { email: string; code: string; newPassword: string }) => api.post("/api/auth/reset", b)

export const logout = () => api.post("/api/auth/logout")
