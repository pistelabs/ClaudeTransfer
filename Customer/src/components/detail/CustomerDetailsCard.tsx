import { BranchPill } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { Field, Input, Select } from '../ui/Field';
import type { Branch, Customer, CustomerEdit, PreferredContact } from '../../types';
import styles from './CustomerDetailsCard.module.css';

const BRANCHES: Branch[] = ['City Branch', 'Mountain Branch'];
const PREFERRED: PreferredContact[] = ['Email', 'SMS', 'Phone'];

interface CustomerDetailsCardProps {
  customer: Customer;
  editing: boolean;
  draft: CustomerEdit;
  onDraftChange: (patch: Partial<CustomerEdit>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CustomerDetailsCard({
  customer,
  editing,
  draft,
  onDraftChange,
  onSave,
  onCancel,
}: CustomerDetailsCardProps) {
  return (
    <Card>
      <CardHeader title="Customer details" className={styles.header} />

      {editing ? (
        <div className={styles.form}>
          <Field label="Name" labelStyle="compact">
            {(id) => (
              <Input
                id={id}
                controlSize="sm"
                value={draft.name}
                onChange={(event) => onDraftChange({ name: event.target.value })}
              />
            )}
          </Field>
          <Field label="Branch" labelStyle="compact">
            {(id) => (
              <Select
                id={id}
                options={BRANCHES}
                value={draft.branch}
                onChange={(event) => onDraftChange({ branch: event.target.value as Branch })}
              />
            )}
          </Field>
          <Field label="Phone" labelStyle="compact">
            {(id) => (
              <Input
                id={id}
                controlSize="sm"
                value={draft.phone}
                onChange={(event) => onDraftChange({ phone: event.target.value })}
              />
            )}
          </Field>
          <Field label="Email" labelStyle="compact">
            {(id) => (
              <Input
                id={id}
                controlSize="sm"
                value={draft.email}
                onChange={(event) => onDraftChange({ email: event.target.value })}
              />
            )}
          </Field>
          <Field label="Preferred contact" labelStyle="compact">
            {(id) => (
              <Select
                id={id}
                options={PREFERRED}
                value={draft.preferred}
                onChange={(event) =>
                  onDraftChange({ preferred: event.target.value as PreferredContact })
                }
              />
            )}
          </Field>
          <div className={styles.formActions}>
            <Button variant="primary" size="sm" className={styles.formButton} onClick={onSave}>
              Save
            </Button>
            <Button size="sm" className={styles.formButton} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt className={styles.label}>Name</dt>
            <dd className={styles.value}>{customer.name}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>Phone</dt>
            <dd className={styles.value}>{customer.phone}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>Email</dt>
            <dd className={styles.email}>{customer.email}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>Preferred</dt>
            <dd className={styles.value}>{customer.preferred}</dd>
          </div>
          <div className={styles.row}>
            <dt className={styles.label}>Branch</dt>
            <dd className={styles.value}>
              <BranchPill branch={customer.branch} />
            </dd>
          </div>
        </dl>
      )}
    </Card>
  );
}
