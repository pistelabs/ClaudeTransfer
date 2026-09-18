import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayPickerProps,
} from "react-day-picker"

import { cn } from "@/lib/utils"

/**
 * Date picker on react-day-picker, themed with the app's tokens: sky for the
 * selection, teal-free neutrals elsewhere, 36px controls like the rest of the
 * form furniture.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: "relative flex flex-col gap-4",
        month: "flex w-full flex-col gap-3",
        month_caption: "flex h-8 w-full items-center justify-center px-8",
        caption_label: "font-heading text-[13px] font-bold",
        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
        button_previous: cn(
          "text-muted-foreground hover:bg-background hover:text-foreground focus-ring border-border flex size-7 items-center justify-center rounded-md border bg-card transition-colors disabled:opacity-40",
        ),
        button_next: cn(
          "text-muted-foreground hover:bg-background hover:text-foreground focus-ring border-border flex size-7 items-center justify-center rounded-md border bg-card transition-colors disabled:opacity-40",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-tertiary-foreground w-9 text-[11px] font-semibold tracking-[0.4px] uppercase",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center",
        day_button: cn(
          "focus-ring size-9 rounded-md text-[13px] transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
        ),
        today: "font-semibold text-primary-hover",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-semibold [&>button:hover]:bg-primary-hover [&>button:hover]:text-primary-foreground",
        outside: "text-placeholder-foreground",
        disabled: "text-placeholder-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron: CalendarChevron }}
      {...props}
    />
  )
}

function CalendarChevron({ orientation, className, ...props }: ChevronProps) {
  const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
  return <Icon className={cn("size-4", className)} {...props} />
}

export { Calendar }
