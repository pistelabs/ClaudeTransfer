import type { KeyboardEvent, MouseEvent } from 'react';
import { ChevronRight, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Checkbox } from '../ui/Checkbox';
import type { Customer } from '../../types';
import styles from './CustomerTable.module.css';

interface CustomerTableProps {
  customers: Customer[];
  selected: Record<string, boolean>;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
}

export function CustomerTable({
  customers,
  selected,
  onToggleAll,
  onToggleOne,
  onOpen,
}: CustomerTableProps) {
  const allChecked = customers.length > 0 && customers.every((c) => selected[c.id]);

  const openOnKey = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(id);
    }
  };

  // Keeps a checkbox click from also opening the customer.
  const stop = (event: MouseEvent) => event.stopPropagation();

  return (
    <div className={styles.table}>
      <div className={styles.head}>
        <div className={styles.checkCell}>
          <Checkbox
            checked={allChecked}
            onChange={(event) => onToggleAll(event.target.checked)}
            aria-label="Select all customers"
          />
        </div>
        <div className={styles.headCellWithIcon}>
          <User size={13} strokeWidth={2} aria-hidden="true" />
          Name
        </div>
        <div className={`${styles.headCell} ${styles.emailCell}`}>Email address</div>
        <div className={`${styles.headCell} ${styles.phoneCell}`}>Phone number</div>
        <div className={styles.headCell}>Last activity</div>
        <div />
      </div>

      {customers.map((customer) => (
        <div
          key={customer.id}
          role="button"
          tabIndex={0}
          aria-label={`Open ${customer.name}`}
          className={styles.bodyRow}
          onClick={() => onOpen(customer.id)}
          onKeyDown={(event) => openOnKey(event, customer.id)}
        >
          <div className={styles.checkCell} onClick={stop}>
            <Checkbox
              checked={!!selected[customer.id]}
              onChange={(event) => onToggleOne(customer.id, event.target.checked)}
              aria-label={`Select ${customer.name}`}
            />
          </div>
          <div className={styles.nameCell}>
            <Avatar name={customer.name} />
            <span className={styles.name}>{customer.name}</span>
          </div>
          <div className={`${styles.truncate} ${styles.emailCell}`}>{customer.email}</div>
          <div className={`${styles.cell} ${styles.phoneCell}`}>{customer.phone}</div>
          <div className={styles.cell}>{customer.last}</div>
          <div className={styles.chevronCell} aria-hidden="true">
            <ChevronRight size={16} strokeWidth={2} />
          </div>
        </div>
      ))}

      {customers.length === 0 ? (
        <div className={styles.empty}>No customers match your search.</div>
      ) : null}
    </div>
  );
}
