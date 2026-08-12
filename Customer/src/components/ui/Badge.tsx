import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';
import type { AppointmentStatus, Branch, EquipmentStatus } from '../../types';
import styles from './Badge.module.css';

export type BadgeTone = 'blue' | 'green' | 'red' | 'amber' | 'dark' | 'muted' | 'accent';
export type BadgeSize = 'status' | 'equipment' | 'service';

const APPOINTMENT_TONES: Record<AppointmentStatus, BadgeTone> = {
  CONFIRMED: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  PENDING: 'amber',
};

const EQUIPMENT_TONES: Record<EquipmentStatus, BadgeTone> = {
  ACTIVE: 'dark',
  RETIRED: 'muted',
};

const BRANCH_TONES: Record<Branch, BadgeTone> = {
  'City Branch': 'blue',
  'Mountain Branch': 'green',
};

export function Badge({
  tone,
  size = 'status',
  children,
}: {
  tone: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
}) {
  return <span className={cx(styles.badge, styles[tone], styles[size])}>{children}</span>;
}

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={APPOINTMENT_TONES[status]}>{status}</Badge>;
}

export function EquipmentBadge({ status }: { status: EquipmentStatus }) {
  return (
    <Badge tone={EQUIPMENT_TONES[status]} size="equipment">
      {status}
    </Badge>
  );
}

/** Branch shown as a dotted pill in the customer details card. */
export function BranchPill({ branch }: { branch: Branch }) {
  return (
    <span className={cx(styles.pill, styles[BRANCH_TONES[branch]])}>
      <span className={styles.dot} aria-hidden="true" />
      {branch}
    </span>
  );
}
