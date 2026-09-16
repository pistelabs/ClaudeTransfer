import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-[20px] leading-tight font-bold tracking-[-0.3px]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1 text-[13px]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
