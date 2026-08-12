import { useState } from 'react';
import { ChevronDown, Wrench } from 'lucide-react';
import { Badge, EquipmentBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { cx } from '../../lib/cx';
import { formatJobId, pluralize } from '../../lib/format';
import type { Branch, Equipment } from '../../types';
import styles from './EquipmentCard.module.css';

interface EquipmentCardProps {
  equipment: Equipment[];
  branch: Branch;
  onOpenJob: (jobId: string, service: string) => void;
}

export function EquipmentCard({ equipment, branch, onOpenJob }: EquipmentCardProps) {
  // Expansion is per item — opening one leaves the others as they were.
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <Card>
      <CardHeader
        icon={<Wrench size={14} strokeWidth={2} aria-hidden="true" />}
        title="Equipment"
        meta={pluralize(equipment.length, 'item')}
      />

      {equipment.length === 0 ? (
        <div className={styles.emptyCard}>No equipment on record.</div>
      ) : (
        <div className={styles.list}>
          {equipment.map((item, index) => {
            const isOpen = !!expanded[index];
            return (
              <div key={`${item.name}-${index}`} className={styles.item}>
                <div className={styles.summaryRow}>
                  <div className={styles.identity}>
                    <div className={styles.titleRow}>
                      <EquipmentBadge status={item.status} />
                      <span className={styles.name}>{item.name}</span>
                      <span className={styles.size}>{item.size}</span>
                    </div>
                    <div className={styles.summary}>
                      {pluralize(item.jobs.length, 'service')} on record
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.toggle}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))}
                  >
                    {isOpen ? 'Hide' : 'Show'}
                    <ChevronDown
                      size={13}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className={cx(styles.chevron, isOpen && styles.chevronOpen)}
                    />
                  </Button>
                </div>

                {isOpen ? (
                  <div className={styles.panel}>
                    <div className={styles.panelLabel}>Jobs completed</div>
                    {item.jobs.length === 0 ? (
                      <div className={styles.emptyLine}>No completed jobs yet.</div>
                    ) : (
                      <div className={styles.jobs}>
                        {item.jobs.map((job) => {
                          const jobId = formatJobId(branch, job.sequence);
                          return (
                            <div key={jobId} className={styles.job}>
                              <div className={styles.jobMeta}>
                                <span className={styles.jobId}>{jobId}</span>
                                <Badge tone="accent" size="service">
                                  {job.service}
                                </Badge>
                                <span className={styles.jobDate}>{job.date}</span>
                              </div>
                              <Button size="xs" onClick={() => onOpenJob(jobId, job.service)}>
                                Open
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
