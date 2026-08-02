import type { CSSProperties, ReactNode } from 'react';

interface AvatarProps {
  initials?: string;
  color?: string;
  size: number;
  /** falls back to a sensible ratio of the diameter */
  fontSize?: number;
  /** dashed neutral circle used for "Unassigned" */
  unassigned?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Avatar({ initials, color, size, fontSize, unassigned, children, style }: AvatarProps) {
  return (
    <span
      className={unassigned ? 'avatar avatar--unassigned' : 'avatar'}
      style={{
        width: size,
        height: size,
        fontSize: fontSize ?? Math.round(size * 0.4 * 10) / 10,
        background: unassigned ? undefined : color,
        ...style,
      }}
    >
      {children ?? initials}
    </span>
  );
}
