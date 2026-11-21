import type { Priority, TicketType } from "@/types/project"

export const TYPE_LABEL: Record<TicketType, string> = { FEATURE: "Feature", HOTFIX: "Hotfix", BUGFIX: "Bug fix" }

export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"]

export const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" }
