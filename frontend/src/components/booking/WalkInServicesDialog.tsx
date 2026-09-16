import { useMemo, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CategoryDot } from "@/components/common/CategoryChip"
import { CATEGORY_LIST } from "@/lib/categories"
import { formatDuration } from "@/lib/time"
import type { Service, ServiceCategory } from "@/lib/types"

interface WalkInServicesDialogProps {
  services: Service[]
  selectedIds: string[]
  onOpenChange: (open: boolean) => void
  onSave: (serviceIds: string[]) => void
}

/** Which services a walk-in customer can join the queue for. */
export function WalkInServicesDialog({
  services,
  selectedIds,
  onOpenChange,
  onSave,
}: WalkInServicesDialogProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds)

  const byCategory = useMemo(() => {
    const grouped = {} as Record<ServiceCategory, Service[]>
    for (const category of CATEGORY_LIST) {
      grouped[category.id] = services.filter((s) => s.category === category.id)
    }
    return grouped
  }, [services])

  function toggleCategory(category: ServiceCategory, checked: boolean) {
    const ids = (byCategory[category] ?? []).map((s) => s.id)
    setSelected((current) =>
      checked
        ? [...new Set([...current, ...ids])]
        : current.filter((id) => !ids.includes(id)),
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bookable on walk-in</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORY_LIST.map((category) => {
            const categoryServices = byCategory[category.id] ?? []
            const chosen = categoryServices.filter((s) =>
              selected.includes(s.id),
            )
            const allChosen =
              categoryServices.length > 0 &&
              chosen.length === categoryServices.length

            return (
              <div
                key={category.id}
                className="border-border overflow-hidden rounded-lg border"
              >
                <div className="bg-muted border-divider flex items-center gap-2 border-b px-2.5 py-2">
                  <Checkbox
                    checked={
                      allChosen
                        ? true
                        : chosen.length > 0
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) =>
                      toggleCategory(category.id, checked !== false)
                    }
                    aria-label={`Select all ${category.label}`}
                  >
                    {!allChosen && chosen.length > 0 ? (
                      <span
                        className="block h-[2.5px] w-2 rounded-full bg-current"
                        aria-hidden
                      />
                    ) : undefined}
                  </Checkbox>
                  <CategoryDot category={category.id} />
                  <span className="flex-1 truncate text-[12.5px] font-semibold">
                    {category.label}
                  </span>
                  <span className="text-tertiary-foreground text-[11px]">
                    Select all · {categoryServices.length}
                  </span>
                </div>
                <div className="divide-divider-light divide-y">
                  {categoryServices.map((service) => (
                    <label
                      key={service.id}
                      className="flex cursor-pointer items-center gap-2 px-2.5 py-2"
                    >
                      <Checkbox
                        checked={selected.includes(service.id)}
                        onCheckedChange={(checked) =>
                          setSelected((current) =>
                            checked === true
                              ? [...new Set([...current, service.id])]
                              : current.filter((id) => id !== service.id),
                          )
                        }
                        aria-label={service.name}
                      />
                      <span className="min-w-0 flex-1 truncate text-[12.5px]">
                        {service.name}
                      </span>
                      <span className="text-tertiary-foreground shrink-0 text-[11px]">
                        {formatDuration(service.duration)} · {service.price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(selected)}>Save selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
