import { cn } from "@/lib/utils"

/** 11px/600 uppercase label that opens each section of the service dialog. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </div>
  )
}
