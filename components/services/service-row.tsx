"use client"

import { ClockIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDuration, formatPrice } from "@/lib/workshop/data"
import type { Service } from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

export function ServiceRow({
  service,
  currencySymbol,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleVisibility,
}: {
  service: Service
  currencySymbol: string
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleVisibility: () => void
}) {
  const duration = formatDuration(service)

  return (
    <div className="flex flex-col gap-2 px-5 py-3.5 transition-colors duration-[120ms] not-first:border-t hover:bg-muted sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: service.disabled ? "var(--muted-foreground)" : service.color }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn("text-sm font-semibold", service.disabled && "text-muted-foreground")}
            >
              {service.name}
            </span>
            {service.pricingType === "quoted" ? <Badge variant="outline">Quoted</Badge> : null}
            {service.disabled ? <Badge variant="secondary">Hidden</Badge> : null}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-2.5 text-xs text-muted-foreground">
            {duration ? (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3" />
                {duration}
              </span>
            ) : null}
            {service.description ? <span className="truncate">{service.description}</span> : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            service.disabled && "text-muted-foreground",
          )}
        >
          {formatPrice(service, currencySymbol)}
        </span>

        <Tooltip>
          {/* Wrapped in a span: TooltipTrigger writes data-state onto its child,
              which would otherwise clash with the Switch's own checked styling. */}
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Switch
                checked={!service.disabled}
                onCheckedChange={onToggleVisibility}
                aria-label={service.disabled ? "Show service" : "Hide service"}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>{service.disabled ? "Hidden from booking" : "Bookable"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit service" onClick={onEdit}>
              <PencilIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Duplicate service"
              onClick={onDuplicate}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicate</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete service"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
