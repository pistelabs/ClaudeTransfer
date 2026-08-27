import { Mail, MessageCircle, X } from 'lucide-react';
import { useScheduler } from '../../store/useScheduler';
import { Button, Label } from '../ui/primitives';
import { useEscape } from '../ui/hooks';

export function NewCustomerDialog() {
  const nc = useScheduler((s) => s.newCust);
  const setNewCust = useScheduler((s) => s.setNewCust);
  const saveNewCust = useScheduler((s) => s.saveNewCust);
  const close = useScheduler((s) => s.closeNewCust);

  useEscape(true, close);

  return (
    <div className="dialog-backdrop" style={{ zIndex: 70 }} onClick={close}>
      <div
        className="dialog"
        style={{ width: 470 }}
        role="dialog"
        aria-modal="true"
        aria-label="Add a customer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">Add a customer</div>
            <div className="dialog__sub">Enter the customer&rsquo;s information below.</div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={close}>
            <X size={17} strokeWidth={2} />
          </Button>
        </div>

        <div className="nc__row" style={{ marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <Label htmlFor="nc-first">First name</Label>
            <input
              className="nc__input"
              id="nc-first"
              value={nc.first}
              placeholder="Jane"
              onChange={(e) => setNewCust({ first: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label htmlFor="nc-last">Last name</Label>
            <input
              className="nc__input"
              id="nc-last"
              value={nc.last}
              placeholder="Doe"
              onChange={(e) => setNewCust({ last: e.target.value })}
            />
          </div>
        </div>

        <div className="nc__row">
          <div style={{ flex: 1 }}>
            <Label htmlFor="nc-email">Email address</Label>
            <input
              className="nc__input"
              id="nc-email"
              type="email"
              value={nc.email}
              placeholder="jane@example.com"
              onChange={(e) => setNewCust({ email: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Label htmlFor="nc-phone">Phone number</Label>
            <input
              className="nc__input"
              id="nc-phone"
              type="tel"
              value={nc.phone}
              placeholder="(604) 555-0100"
              onChange={(e) => setNewCust({ phone: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Label>Preferred contact channel</Label>
          <div style={{ display: 'flex', gap: 14 }}>
            <button
              className={`nc__channel${nc.channel === 'Email' ? ' nc__channel--on' : ''}`}
              type="button"
              aria-pressed={nc.channel === 'Email'}
              onClick={() => setNewCust({ channel: 'Email' })}
            >
              <Mail size={16} strokeWidth={2} />
              Email
            </button>
            <button
              className={`nc__channel${nc.channel === 'SMS' ? ' nc__channel--on' : ''}`}
              type="button"
              aria-pressed={nc.channel === 'SMS'}
              onClick={() => setNewCust({ channel: 'SMS' })}
            >
              <MessageCircle size={16} strokeWidth={2} />
              SMS
            </button>
          </div>
        </div>

        <div className="dialog__actions">
          <Button variant="outline" size="lg" onClick={close}>
            Cancel
          </Button>
          <Button size="lg" className="nc__save" disabled={!nc.first.trim()} onClick={saveNewCust}>
            Add customer
          </Button>
        </div>
      </div>
    </div>
  );
}
