"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BellIcon, CalendarIcon, SettingsIcon, SnowflakeIcon, WrenchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const SECTIONS = [
  { href: "/admin/general", label: "General", icon: SettingsIcon },
  { href: "/admin/equipment", label: "Equipment Types", icon: SnowflakeIcon },
  { href: "/admin/services", label: "Services", icon: WrenchIcon },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
  { href: "/admin/notifications", label: "Notifications", icon: BellIcon },
]

/** Segmented section nav in a muted track, matching the shadcn TabsList treatment. */
export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="mx-auto flex w-full max-w-[1040px] gap-1 overflow-x-auto px-8 pb-3">
      <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-[3px]">
        {SECTIONS.map((section) => {
          const active = pathname.startsWith(section.href)
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[13.5px] font-medium whitespace-nowrap transition-all duration-[120ms]",
                "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <section.icon className="size-[15px]" />
              {section.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
