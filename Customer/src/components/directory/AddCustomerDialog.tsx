import { useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogFooter, DialogHeader, useDialogTitleId } from '../ui/Dialog';
import { Field, Input } from '../ui/Field';
import type { NewCustomerInput } from '../../types';
import styles from './AddCustomerDialog.module.css';

const EMPTY: NewCustomerInput = { first: '', last: '', email: '', phone: '', channel: 'Email' };

interface AddCustomerDialogProps {
  onClose: () => void;
  onSubmit: (input: NewCustomerInput) => void;
}

export function AddCustomerDialog({ onClose, onSubmit }: AddCustomerDialogProps) {
  const titleId = useDialogTitleId();
  const [form, setForm] = useState<NewCustomerInput>(EMPTY);

  const set = <K extends keyof NewCustomerInput>(key: K, value: NewCustomerInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // A name is the one thing a customer record cannot be created without.
  const nameReady = Boolean(form.first.trim() || form.last.trim());

  return (
    <Dialog onClose={onClose} maxWidth={520} labelledBy={titleId}>
      <DialogHeader
        id={titleId}
        title="Add a customer"
        description="Enter the customer's information below."
        onClose={onClose}
      />

      <div className={styles.grid}>
        <Field label="First name">
          {(id) => (
            <Input
              id={id}
              value={form.first}
              onChange={(event) => set('first', event.target.value)}
              placeholder="Jane"
              autoFocus
            />
          )}
        </Field>
        <Field label="Last name">
          {(id) => (
            <Input
              id={id}
              value={form.last}
              onChange={(event) => set('last', event.target.value)}
              placeholder="Doe"
            />
          )}
        </Field>
        <Field label="Email address">
          {(id) => (
            <Input
              id={id}
              type="email"
              value={form.email}
              onChange={(event) => set('email', event.target.value)}
              placeholder="jane@example.com"
            />
          )}
        </Field>
        <Field label="Phone number">
          {(id) => (
            <Input
              id={id}
              type="tel"
              value={form.phone}
              onChange={(event) => set('phone', event.target.value)}
              placeholder="(604) 555-0100"
            />
          )}
        </Field>
      </div>

      <div className={styles.channels}>
        <div className={styles.channelLabel} id={`${titleId}-channel`}>
          Preferred contact channel
        </div>
        <div className={styles.channelGrid} role="group" aria-labelledby={`${titleId}-channel`}>
          <Button
            size="xl"
            variant={form.channel === 'Email' ? 'primary' : 'secondary'}
            aria-pressed={form.channel === 'Email'}
            onClick={() => set('channel', 'Email')}
          >
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
            Email
          </Button>
          <Button
            size="xl"
            variant={form.channel === 'SMS' ? 'primary' : 'secondary'}
            aria-pressed={form.channel === 'SMS'}
            onClick={() => set('channel', 'SMS')}
          >
            <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            SMS
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button size="lg" variant="primary" disabled={!nameReady} onClick={() => onSubmit(form)}>
          Add customer
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
