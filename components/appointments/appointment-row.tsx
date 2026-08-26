"use client"

import * as React from "react"
import { ClockIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DragHandle } from "@/components/workshop/drag-handle"
import { formatDuration, formatPrice } from "@/lib/workshop/data"
import type { Appointment } from "@/lib/workshop/types"
import { cn } from "@/lib/utils"

export function AppointmentRow({
  appointment,
  currencySymbol,
  busy = false,
  dragging = false,
  dropTarget = false,
  dragHandleProps,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onDragStart,
  onDragEnd,
  ...dragProps
}: {
  appointment: Appointment
  currencySymbol: string
  /** True while a request for this appointment is in flight. */
  busy?: boolean
  /** True while this row is the one being dragged. */
  dragging?: boolean
  /** True while a dragged row would drop here. */
  dropTarget?: boolean
  dragHandleProps?: Pick<React.ComponentProps<"button">, "onKeyDown">
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleVisibility: () => void
} & React.ComponentProps<"div">) {
  const duration = formatDuration(appointment)
  // Set synchronously on pointer-down so dragstart in the same gesture sees it.
  const armed = React.useRef(false)

  return (
    <div
      draggable
      onDragStart={(event) => {
        // Only a drag that began on the grip reorders the row.
        if (!armed.current) {
          event.preventDefault()
          return
        }
        onDragStart?.(event)
      }}
      onDragEnd={(event) => {
        armed.current = false
        onDragEnd?.(event)
      }}
      className={cn(
        "flex flex-col gap-2 px-5 py-3.5 transition-colors duration-[120ms] not-first:border-t hover:bg-muted sm:flex-row sm:items-center sm:gap-3",
        dragging && "opacity-40",
        dropTarget && !dragging && "bg-primary/5 ring-1 ring-primary/40 ring-inset",
      )}
      {...dragProps}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <DragHandle
          label={"Reorder " + appointment.name}
          className="mt-0.5"
          onPointerDown={() => {
            armed.current = true
          }}
          onPointerUp={() => {
            armed.current = false
          }}
          {...dragHandleProps}
        />
        <span
          aria-hidden
          className="mt-2 size-2.5 shrink-0 rounded-sm"
          style={{
            backgroundColor: appointment.disabled ? "var(--muted-foreground)" : appointment.color,
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                appointment.disabled && "text-muted-foreground",
              )}
            >
              {appointment.name}
            </span>
            {appointment.mode === "checkin" ? <Badge variant="secondary">Check-in</Badge> : null}
            {appointment.disabled ? (
              <Badge variant="outline" className="text-muted-foreground">
                Hidden
              </Badge>
            ) : null}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-2.5 text-xs text-muted-foreground">
            {duration ? (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                <ClockIcon className="size-3" />
                {duration}
              </span>
            ) : null}
            {appointment.description ? (
              <span className="truncate">{appointment.description}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3">
        {appointment.mode === "work" ? (
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              appointment.disabled && "text-muted-foreground",
            )}
          >
            {formatPrice({ price: appointment.price, pricingType: "fixed" }, currencySymbol)}
          </span>
        ) : null}

        <Tooltip>
          {/* Wrapped in a span: TooltipTrigger writes data-state onto its child,
              which would otherwise clash with the Switch's own checked styling. */}
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Switch
                checked={!appointment.disabled}
                disabled={busy}
                onCheckedChange={onToggleVisibility}
                aria-label={appointment.disabled ? "Show appointment" : "Hide appointment"}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {appointment.disabled ? "Hidden from booking" : "Bookable"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit appointment" onClick={onEdit}>
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
              aria-label="Duplicate appointment"
              disabled={busy}
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
              aria-label="Delete appointment"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={busy}
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
