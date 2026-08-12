import { useEffect, useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../lib/cx';
import styles from './Dialog.module.css';

export type DialogVariant = 'padded' | 'sectioned';
export type DialogTitleSize = 'lg' | 'md' | 'sm';

interface DialogProps {
  onClose: () => void;
  /** Panel max width, e.g. 520 for "Add a customer". */
  maxWidth: number;
  variant?: DialogVariant;
  align?: 'start' | 'center';
  /** Softens and blurs the backdrop (Export, Stored signature). */
  blurred?: boolean;
  /** Raises the stacking order for dialogs opened on top of another. */
  zIndex?: number;
  labelledBy: string;
  children: ReactNode;
}

/**
 * Modal shell: backdrop click and Escape close it, clicks inside do not.
 */
export function Dialog({
  onClose,
  maxWidth,
  variant = 'padded',
  align = 'start',
  blurred = false,
  zIndex,
  labelledBy,
  children,
}: DialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const overlayStyle: CSSProperties | undefined = zIndex === undefined ? undefined : { zIndex };

  return (
    <div
      className={cx(
        styles.overlay,
        align === 'center' ? styles.alignCenter : styles.alignStart,
        blurred && styles.blurred,
      )}
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx(styles.panel, variant === 'padded' ? styles.padded : styles.sectioned)}
        style={{ maxWidth }}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  id: string;
  title: string;
  description?: string;
  onClose: () => void;
  size?: DialogTitleSize;
  /** `floating` places the close button in the panel corner. */
  closePlacement?: 'floating' | 'inline';
}

export function DialogHeader({
  id,
  title,
  description,
  onClose,
  size = 'lg',
  closePlacement = 'floating',
}: DialogHeaderProps) {
  const heading = (
    <div className={styles[size]}>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );

  const close = (
    <button
      type="button"
      aria-label="Close dialog"
      onClick={onClose}
      className={cx(
        styles.close,
        closePlacement === 'floating' ? styles.closeFloating : styles.closeInline,
      )}
    >
      <X size={closePlacement === 'floating' ? 18 : 17} strokeWidth={2} />
    </button>
  );

  if (closePlacement === 'floating') {
    return (
      <>
        {close}
        {heading}
      </>
    );
  }

  return (
    <div className={styles.header}>
      {heading}
      {close}
    </div>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}

/** Stable id for wiring `aria-labelledby` to a dialog's heading. */
export function useDialogTitleId(): string {
  return useId();
}
