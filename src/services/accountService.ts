import { api } from "@/services/apiClient"
import type { Account, Device } from "@/types/account"

export const getAccount = async () => (await api.get<Account>("/api/account")).data
export const renameAccount = async (displayName: string) => (await api.patch<Account>("/api/account", { displayName })).data
export const changePassword = (b: { currentPassword: string; newPassword: string }) => api.post("/api/account/password", b)
export const getDevices = async () => (await api.get<Device[]>("/api/account/devices")).data
export const removeDevice = (id: number) => api.delete(`/api/account/devices/${id}`)
export const signOutOthers = () => api.post("/api/account/sessions/sign-out-others")
