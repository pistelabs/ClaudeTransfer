import type { ButtonHTMLAttributes, HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';

/**
 * shadcn/ui/-shaped primitives.
 *
 * The project styles with plain CSS and design tokens rather than Tailwind, so
 * these mirror shadcn's component anatomy and variant names (Card/CardHeader/
 * CardTitle/…, Badge variants, Button variants and sizes) against the tokens in
 * `styles/tokens.css`. Swapping them for the generated shadcn components later is
 * a like-for-like change because the props line up.
 */

function cx(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ---- Card ----------------------------------------------------------------

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return <div className={cx('card', className)} {...props} />;
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cx('card__header', className)} {...props} />;
}

export function CardTitle({ className, ...props }: DivProps) {
  return <div className={cx('card__title', className)} {...props} />;
}

export function CardDescription({ className, ...props }: DivProps) {
  return <div className={cx('card__description', className)} {...props} />;
}

export function CardAction({ className, ...props }: DivProps) {
  return <div className={cx('card__action', className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cx('card__content', className)} {...props} />;
}

// ---- Badge ---------------------------------------------------------------

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';

export function Badge({
  variant = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cx('badge', `badge--${variant}`, className)} {...props} />;
}

// ---- Separator -----------------------------------------------------------

export function Separator({
  orientation = 'horizontal',
  className,
  ...props
}: DivProps & { orientation?: 'horizontal' | 'vertical' }) {
  return <div role="separator" className={cx('separator', `separator--${orientation}`, className)} {...props} />;
}

// ---- Label ---------------------------------------------------------------

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx('label', className)} {...props} />;
}

// ---- Button --------------------------------------------------------------

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export function Button({
  variant = 'default',
  size = 'default',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  // Size classes are namespaced: `variant` and `size` share the name "default".
  return (
    <button type={type} className={cx('button', `button--${variant}`, `button--size-${size}`, className)} {...props} />
  );
}

// ---- Definition row ------------------------------------------------------

/**
 * A labelled fact inside a Card — the read-only counterpart to Label + Input.
 * Pass `control` when the value is an interactive field rather than text, so it
 * gets left-aligned and room to breathe, and `full` to span a fact grid's columns.
 */
export function DataRow({
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
    <div className={cx('data-row', control && 'data-row--control', full && 'data-row--full')}>
      <dt className="data-row__label">
        {icon}
        {label}
      </dt>
      <dd className="data-row__value">{children}</dd>
    </div>
  );
}
