import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Card.module.css';

interface CardProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Card({ className, style, children }: CardProps) {
  return (
    <section className={cx(styles.card, className)} style={style}>
      {children}
    </section>
  );
}

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  /** Right-hand count, e.g. "2 items". */
  meta?: string;
  className?: string;
}

export function CardHeader({ icon, title, meta, className }: CardHeaderProps) {
  return (
    <div className={cx(styles.header, className)}>
      <h2 className={styles.title}>
        {icon}
        {title}
      </h2>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </div>
  );
}
