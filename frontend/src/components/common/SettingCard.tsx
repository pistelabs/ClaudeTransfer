import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface SettingCardProps {
  icon: ReactNode
  /** Tailwind classes for the 42px icon tile (bg + text colour). */
  tileClassName?: string
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  switchLabel: string
  /** Body expands and collapses with the switch. */
  children?: ReactNode
}

export function SettingCard({
  icon,
  tileClassName,
  title,
  description,
  checked,
  onCheckedChange,
  switchLabel,
  children,
}: SettingCardProps) {
  return (
    <Card className="gap-0 rounded-xl p-[18px] shadow-card">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-[42px] shrink-0 items-center justify-center rounded-lg",
            tileClassName ?? "bg-sky-50 text-primary",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[15px] font-bold tracking-[-0.2px]">
            {title}
          </div>
          <p className="text-muted-foreground mt-0.5 text-[12.5px]">
            {description}
          </p>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={switchLabel}
        />
      </div>
      {checked && children && (
        <div className="border-divider mt-[14px] border-t pt-[14px]">
          {children}
        </div>
      )}
    </Card>
  )
}
