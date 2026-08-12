import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { AppointmentBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { cx } from '../../lib/cx';
import { pluralize } from '../../lib/format';
import type { Appointment } from '../../types';
import styles from './AppointmentHistoryCard.module.css';

export function AppointmentHistoryCard({ appointments }: { appointments: Appointment[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <Card>
      <CardHeader
        icon={<Calendar size={14} strokeWidth={2} aria-hidden="true" />}
        title="Appointment history"
        meta={pluralize(appointments.length, 'record')}
      />

      {appointments.length === 0 ? (
        <div className={styles.empty}>No appointments on record.</div>
      ) : (
        <div className={styles.list}>
          {appointments.map((appointment, index) => {
            const isOpen = !!open[index];
            return (
              <div key={`${appointment.date}-${appointment.time}`} className={styles.record}>
                <div className={styles.summaryRow}>
                  <div className={styles.identity}>
                    <div className={styles.titleRow}>
                      <span className={styles.date}>{appointment.date}</span>
                      <span className={styles.time}>{appointment.time}</span>
                      <AppointmentBadge status={appointment.status} />
                    </div>
                    <div className={styles.service}>{appointment.service}</div>
                  </div>
                  <Button
                    size="xs"
                    className={styles.toggle}
                    aria-expanded={isOpen}
                    onClick={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
                  >
                    Open
                    <ChevronDown
                      size={13}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className={cx(styles.chevron, isOpen && styles.chevronOpen)}
                    />
                  </Button>
                </div>

                {isOpen ? (
                  <div className={styles.detail}>
                    <div>
                      <div className={styles.detailLabel}>Service</div>
                      <div className={styles.detailValue}>{appointment.service}</div>
                    </div>
                    <div>
                      <div className={styles.detailLabel}>Technician</div>
                      <div className={styles.detailValue}>{appointment.tech}</div>
                    </div>
                    <div>
                      <div className={styles.detailLabel}>Price</div>
                      <div className={styles.detailValue}>{appointment.price}</div>
                    </div>
                    <div>
                      <div className={styles.detailLabel}>Notes</div>
                      <div className={styles.notes}>{appointment.notes || '—'}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
