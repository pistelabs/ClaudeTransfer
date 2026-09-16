import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { StaffMember } from "@/lib/types"

interface StaffAvatarProps {
  staff: Pick<StaffMember, "initials" | "color" | "name">
  size?: number
  className?: string
}

/** Initials avatar in the person's fixed colour. */
export function StaffAvatar({ staff, size = 28, className }: StaffAvatarProps) {
  return (
    <Avatar
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <AvatarFallback
        style={{
          backgroundColor: staff.color,
          fontSize: Math.max(9, Math.round(size * 0.38)),
        }}
      >
        {staff.initials}
      </AvatarFallback>
    </Avatar>
  )
}
