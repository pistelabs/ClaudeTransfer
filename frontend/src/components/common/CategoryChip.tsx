import { CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"
import type { ServiceCategory } from "@/lib/types"

export function CategoryDot({
  category,
  size = 7,
  className,
}: {
  category: ServiceCategory
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn("inline-block shrink-0 rounded-full", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: CATEGORIES[category].dot,
      }}
      aria-hidden
    />
  )
}

export function CategoryChip({
  category,
  className,
}: {
  category: ServiceCategory
  className?: string
}) {
  const style = CATEGORIES[category]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-[3px] text-[11px] font-semibold",
        className,
      )}
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <CategoryDot category={category} size={6} />
      {style.label}
    </span>
  )
}

export function CategoryLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-tertiary-foreground text-[11px] font-semibold tracking-[0.4px] uppercase">
        Bookable:
      </span>
      {Object.values(CATEGORIES).map((c) => (
        <span
          key={c.id}
          className="text-muted-foreground flex items-center gap-1.5 text-[12px]"
        >
          <CategoryDot category={c.id} />
          {c.label}
        </span>
      ))}
    </div>
  )
}
