export interface User {
  id: number
  email: string
  displayName: string
}

export type OtpPurpose = "VERIFY_EMAIL" | "NEW_DEVICE"

export type LoginOutcome = { kind: "signedIn"; user: User } | { kind: "otp" } | { kind: "unverified" }
