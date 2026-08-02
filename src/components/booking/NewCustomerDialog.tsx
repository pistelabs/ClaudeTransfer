import { Mail, MessageCircle, X } from 'lucide-react';
import { useScheduler } from '../../store/useScheduler';
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
          <button className="dialog__close" type="button" aria-label="Close" onClick={close}>
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        <div className="nc__row" style={{ marginTop: 20 }}>
          <div style={{ flex: 1 }}>
            <label className="nc__label" htmlFor="nc-first">
              First name
            </label>
            <input
              className="nc__input"
              id="nc-first"
              value={nc.first}
              placeholder="Jane"
              onChange={(e) => setNewCust({ first: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="nc__label" htmlFor="nc-last">
              Last name
            </label>
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
            <label className="nc__label" htmlFor="nc-email">
              Email address
            </label>
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
            <label className="nc__label" htmlFor="nc-phone">
              Phone number
            </label>
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
          <span className="nc__label">Preferred contact channel</span>
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
          <button className="btn-secondary" type="button" onClick={close}>
            Cancel
          </button>
          <button className="nc__save" type="button" disabled={!nc.first.trim()} onClick={saveNewCust}>
            Add customer
          </button>
        </div>
      </div>
    </div>
  );
}
