import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayPickerProps,
} from "react-day-picker"

import { cn } from "@/lib/utils"

/**
 * Date picker on react-day-picker, themed with the app's tokens: sky for the
 * selection, 36px day cells to match the rest of the form furniture, and weeks
 * starting on Monday like every other schedule surface.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  captionLayout = "label",
  ...props
}: DayPickerProps) {
  const defaults = getDefaultClassNames()
  const hasDropdowns = captionLayout.startsWith("dropdown")

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      captionLayout={captionLayout}
      className={cn("w-fit", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: "relative flex flex-col gap-4",
        month: "flex w-full flex-col gap-3",
        month_caption: cn(
          "flex h-8 w-full items-center px-8",
          hasDropdowns ? "justify-center gap-2" : "justify-center",
        ),
        caption_label: hasDropdowns
          ? "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-[13px] font-semibold [&>svg]:size-3.5 [&>svg]:text-muted-foreground"
          : "font-heading text-[13px] font-bold",
        dropdowns: "flex items-center gap-2",
        dropdown_root:
          "border-input bg-card shadow-card has-focus:border-primary has-focus:ring-ring relative rounded-md border has-focus:ring-[3px]",
        dropdown: "absolute inset-0 size-full cursor-pointer opacity-0",
        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
        button_previous:
          "text-muted-foreground hover:bg-background hover:text-foreground focus-ring border-border bg-card flex size-7 items-center justify-center rounded-md border transition-colors disabled:opacity-40",
        button_next:
          "text-muted-foreground hover:bg-background hover:text-foreground focus-ring border-border bg-card flex size-7 items-center justify-center rounded-md border transition-colors disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-tertiary-foreground w-9 text-[11px] font-semibold tracking-[0.4px] uppercase",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center",
        day_button:
          "focus-ring hover:bg-accent hover:text-accent-foreground size-9 rounded-md text-[13px] transition-colors",
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
  const Icon =
    orientation === "left"
      ? ChevronLeftIcon
      : orientation === "down"
        ? ChevronDownIcon
        : ChevronRightIcon
  return <Icon className={cn("size-4", className)} {...props} />
}

export { Calendar }
