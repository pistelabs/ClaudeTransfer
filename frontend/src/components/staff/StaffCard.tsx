import { ClockIcon, MailIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { StaffAvatar } from "@/components/common/StaffAvatar"
import type { StaffMember } from "@/lib/types"

interface StaffCardProps {
  staff: StaffMember
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export function StaffCard({ staff, onOpen, onEdit, onDelete }: StaffCardProps) {
  return (
    <Card className="gap-0 rounded-xl p-[18px] shadow-card">
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring rounded-md text-left"
      >
        <div className="flex items-center gap-3">
          <StaffAvatar staff={staff} size={44} />
          <div className="min-w-0 flex-1">
            <div className="font-heading truncate text-[15px] font-semibold">
              {staff.name}
            </div>
            <div className="text-muted-foreground truncate text-[12.5px]">
              {staff.role}
            </div>
          </div>
          <Badge className="bg-teal-50 text-teal-700 border-teal-100 border">
            {staff.status}
          </Badge>
        </div>

        <div className="text-muted-foreground mt-3 flex items-center gap-2 text-[12.5px]">
          <MailIcon className="text-placeholder-foreground size-3.5 shrink-0" />
          <span className="truncate">{staff.email}</span>
        </div>
      </button>

      <div className="border-divider mt-3.5 flex items-center justify-between border-t pt-3">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[12.5px]">
          <ClockIcon className="text-teal-600 size-3.5" />
          {staff.availableHours} h / wk
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:bg-background hover:text-foreground focus-ring flex size-7 items-center justify-center rounded-md transition-colors"
            aria-label={`Edit ${staff.name}`}
          >
            <PencilIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:bg-destructive-tint hover:text-destructive focus-ring flex size-7 items-center justify-center rounded-md transition-colors"
            aria-label={`Delete ${staff.name}`}
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      </div>
    </Card>
  )
}
