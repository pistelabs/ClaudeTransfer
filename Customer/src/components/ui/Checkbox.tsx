import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../lib/cx';
import styles from './Checkbox.module.css';

export function Checkbox({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cx(styles.checkbox, className)} {...rest} />;
}

interface CheckboxTileProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** A full-width bordered checkbox row that tints when checked. */
export function CheckboxTile({ label, checked, onChange }: CheckboxTileProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(styles.tile, checked && styles.tileChecked)}
    >
      <span className={cx(styles.box, checked && styles.boxChecked)} aria-hidden="true">
        {checked ? <Check size={10} strokeWidth={3.5} /> : null}
      </span>
      {label}
    </button>
  );
}
