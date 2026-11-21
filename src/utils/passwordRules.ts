export const MIN_PASSWORD = 12

const COMMON = ["password1234", "123456789012", "qwertyuiop12", "letmein12345", "iloveyou1234", "admin1234567"]

export function passwordChecks(password: string, email: string) {
  const name = email.split("@")[0]?.toLowerCase() ?? ""
  return {
    length: password.length >= MIN_PASSWORD,
    common: password.length > 0 && !COMMON.includes(password.toLowerCase()) && new Set(password).size >= 4,
    email: password.length > 0 && !(name.length > 2 && password.toLowerCase().includes(name)),
  }
}

export function passwordScore(password: string, email: string): number {
  const c = passwordChecks(password, email)
  if (!c.length || !c.common || !c.email) return password.length >= 8 ? 1 : password.length > 0 ? 1 : 0
  if (password.length >= 20) return 4
  if (password.length >= 16) return 3
  return 2
}

