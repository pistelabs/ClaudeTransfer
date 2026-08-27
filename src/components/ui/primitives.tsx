import { cloneElement, createContext, useContext } from 'react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  LabelHTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import { useEscape, useOutsideClick } from './hooks';

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

/**
 * shadcn's own set, plus two the design asks for: `pay` is the money-in green of
 * the payment banner's primary action, and `dark` the near-black it pairs with —
 * neither exists in shadcn's neutral palette.
 */
export type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'pay'
  | 'dark';
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

// ---- ButtonGroup ---------------------------------------------------------

/** Buttons joined into one control: inner corners flattened, no gap between. */
export function ButtonGroup({ className, ...props }: DivProps) {
  return <div role="group" className={cx('button-group', className)} {...props} />;
}

// ---- DropdownMenu / Popover ----------------------------------------------

/**
 * Both are the same machinery — an anchored panel that closes on Escape or an
 * outside click — so they share it, exactly as shadcn's do underneath. Open state
 * is controlled, since it lives in the scheduler store.
 */
interface LayerCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  kind: 'menu' | 'dialog';
}

const Layer = createContext<LayerCtx | null>(null);

function useLayer(): LayerCtx {
  const ctx = useContext(Layer);
  if (!ctx) throw new Error('Trigger and Content must sit inside their DropdownMenu or Popover');
  return ctx;
}

interface RootProps extends DivProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function LayerRoot({ open, onOpenChange, kind, className, children, ...props }: RootProps & { kind: LayerCtx['kind'] }) {
  const ref = useOutsideClick<HTMLDivElement>(open, () => onOpenChange(false));
  useEscape(open, () => onOpenChange(false));
  return (
    <Layer.Provider value={{ open, setOpen: onOpenChange, kind }}>
      <div className={cx('popover-anchor', className)} ref={ref} {...props}>
        {children}
      </div>
    </Layer.Provider>
  );
}

export function DropdownMenu(props: RootProps) {
  return <LayerRoot kind="menu" {...props} />;
}

export function Popover(props: RootProps) {
  return <LayerRoot kind="dialog" {...props} />;
}

/**
 * `asChild` hands the trigger behaviour to whatever element is passed, so a
 * Button stays a Button — the same escape hatch shadcn's Radix triggers give.
 */
function LayerTrigger({ asChild, children }: { asChild?: boolean; children: ReactElement }) {
  const { open, setOpen, kind } = useLayer();
  const child = children as ReactElement<{ onClick?: (e: MouseEvent<HTMLElement>) => void }>;
  const trigger = {
    'aria-haspopup': kind,
    'aria-expanded': open,
    onClick: (e: MouseEvent<HTMLElement>) => {
      child.props.onClick?.(e);
      setOpen(!open);
    },
  };
  return asChild ? (
    cloneElement(child, trigger)
  ) : (
    <button type="button" {...trigger}>
      {children}
    </button>
  );
}

export const DropdownMenuTrigger = LayerTrigger;
export const PopoverTrigger = LayerTrigger;

interface ContentProps extends DivProps {
  /** which edge of the trigger the panel lines up with */
  align?: 'start' | 'end';
  /** which way it opens; the sheet footer sits at the bottom, so `top` is common */
  side?: 'top' | 'bottom';
}

function LayerContent({
  base,
  align = 'start',
  side = 'bottom',
  className,
  ...props
}: ContentProps & { base: string }) {
  const { open, kind } = useLayer();
  if (!open) return null;
  return (
    <div
      role={kind === 'menu' ? 'menu' : 'dialog'}
      className={cx(base, `${base}--${align}`, `${base}--${side}`, className)}
      {...props}
    />
  );
}

export function DropdownMenuContent(props: ContentProps) {
  return <LayerContent base="dropdown-menu" {...props} />;
}

export function PopoverContent(props: ContentProps) {
  return <LayerContent base="popover" {...props} />;
}

export function DropdownMenuItem({
  variant = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'destructive' }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx('dropdown-menu__item', variant !== 'default' && `dropdown-menu__item--${variant}`, className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: DivProps) {
  return <div className={cx('dropdown-menu__label', className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: DivProps) {
  return <div role="separator" className={cx('dropdown-menu__separator', className)} {...props} />;
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
