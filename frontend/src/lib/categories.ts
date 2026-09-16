import type { ServiceCategory } from "./types"

export interface CategoryStyle {
  id: ServiceCategory
  label: string
  bg: string
  fg: string
  dot: string
}

/** The four service categories, colour-coded consistently across the app. */
export const CATEGORIES: Record<ServiceCategory, CategoryStyle> = {
  rental: {
    id: "rental",
    label: "Rentals",
    bg: "var(--cat-rental-bg)",
    fg: "var(--cat-rental-fg)",
    dot: "var(--cat-rental-dot)",
  },
  tuning: {
    id: "tuning",
    label: "Tuning",
    bg: "var(--cat-tuning-bg)",
    fg: "var(--cat-tuning-fg)",
    dot: "var(--cat-tuning-dot)",
  },
  lessons: {
    id: "lessons",
    label: "Lessons",
    bg: "var(--cat-lessons-bg)",
    fg: "var(--cat-lessons-fg)",
    dot: "var(--cat-lessons-dot)",
  },
  fitting: {
    id: "fitting",
    label: "Boot Fitting",
    bg: "var(--cat-fitting-bg)",
    fg: "var(--cat-fitting-fg)",
    dot: "var(--cat-fitting-dot)",
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)

/** Avatar colours are assigned per person, in this order, and stay fixed. */
export const AVATAR_COLORS = [
  "#0284c7",
  "#0d9488",
  "#d97706",
  "#7c3aed",
  "#78716c",
  "#be185d",
  "#0891b2",
] as const

export const LEAVE_TYPE_STYLES = {
  Vacation: { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
  Sick: { bg: "#fef2f2", fg: "#b91c1c", border: "#fecaca" },
  Personal: { bg: "#f5f3ff", fg: "#6d28d9", border: "#ddd6fe" },
} as const
