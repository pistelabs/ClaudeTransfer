import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A labelled fact inside a Card — the read-only counterpart to Label + Input.
 * No shadcn equivalent; it is this app's own, written to the same conventions.
 * Pass `control` when the value is an interactive field rather than text, so it
 * gets left-aligned and room to breathe, and `full` to span a fact grid's columns.
 */
function DataRow({
  icon,
  label,
  control,
  full,
  children,
}: {
  icon?: ReactNode;
  label: string;
  control?: boolean;
  /** span the full width of a multi-column fact grid */
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-slot="data-row"
      className={cn('data-row', control && 'data-row--control', full && 'data-row--full')}
    >
      <dt className="data-row__label">
        {icon}
        {label}
      </dt>
      <dd className="data-row__value">{children}</dd>
    </div>
  );
}

export { DataRow };
