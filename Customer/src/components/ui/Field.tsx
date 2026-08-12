import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../lib/cx';
import styles from './Field.module.css';

export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'value';
export type LabelStyle = 'dialog' | 'compact' | 'tiny';

interface FieldProps {
  label: string;
  /** Label typography: dialog forms, sidebar form, or the DIN calculator. */
  labelStyle?: LabelStyle;
  className?: string;
  children: (id: string) => ReactNode;
}

/** A label above a control, wired together by a generated id. */
export function Field({ label, labelStyle = 'dialog', className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cx(styles.field, styles[labelStyle], className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children(id)}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  controlSize?: ControlSize;
}

export function Input({ controlSize = 'lg', className, ...rest }: InputProps) {
  return <input className={cx(styles.control, styles[controlSize], className)} {...rest} />;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  controlSize?: ControlSize;
  options: readonly string[];
  /** Draws our own chevron instead of the platform one (toolbar filter). */
  customChevron?: boolean;
}

export function Select({
  controlSize = 'sm',
  options,
  customChevron = false,
  className,
  ...rest
}: SelectProps) {
  const select = (
    <select
      className={cx(
        styles.control,
        styles[controlSize],
        customChevron && styles.customChevron,
        className,
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  if (!customChevron) return select;

  return (
    <span className={styles.customChevronWrap}>
      {select}
      <span className={styles.chevron} aria-hidden="true">
        <ChevronDown size={14} strokeWidth={2} />
      </span>
    </span>
  );
}
