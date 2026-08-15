import { Banknote, Check, Clock, CreditCard, Link2, Store, Wallet, X } from 'lucide-react';
import { PAYMENT_METHODS, STAFF, paymentMethod } from '../../data/catalogue';
import { formatMoney } from '../../lib/schedule';
import { useScheduler } from '../../store/useScheduler';
import { Badge } from '../ui/primitives';
import { useOutsideClick } from '../ui/hooks';
import type { PaymentMethod } from '../../types';
import type { DetailInfo } from './useDetail';

/** Each route gets its own mark so the recorded method is recognisable at a glance. */
const METHOD_ICON: Record<PaymentMethod, typeof CreditCard> = {
  shopify: Store,
  'shopify-link': Link2,
  square: CreditCard,
  stripe: Wallet,
  external: Banknote,
};

/**
 * The Paid figure in the totals bar, and the popover behind it. The shop has no
 * cash drawer, so every route it runs itself is a card payment — the popover
 * records which one, against the balance showing beside it.
 */
export function PaymentControl({ totals }: { totals: DetailInfo['totals'] }) {
  const open = useScheduler((s) => s.paymentMenu);
  const toggle = useScheduler((s) => s.togglePaymentMenu);
  const close = useScheduler((s) => s.closePaymentMenu);
  const record = useScheduler((s) => s.recordPayment);
  const clear = useScheduler((s) => s.clearPayment);

  const ref = useOutsideClick<HTMLDivElement>(open, close);
  const { payment, due } = totals;
  const method = payment ? paymentMethod(payment.method) : null;
  const Icon = payment ? METHOD_ICON[payment.method] : CreditCard;
  const taker = payment && payment.by !== null ? STAFF[payment.by] : null;

  return (
    <dd className="popover-anchor totals__pay" ref={ref}>
      <button
        className={`pay-btn${payment ? (payment.pending ? ' pay-btn--pending' : ' pay-btn--paid') : ''}`}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        title={
          payment
            ? payment.pending
              ? `Payment link sent at ${payment.at} — click to change`
              : `Paid by ${payment.source ?? method!.label} at ${payment.at} — click to change`
            : 'Record how this was paid'
        }
        onClick={toggle}
      >
        {payment?.pending && <Clock size={13} strokeWidth={2.4} />}
        {payment && !payment.pending && <Check size={13} strokeWidth={2.8} />}
        {totals.paid}
      </button>

      {open && (
        <div className="pay-menu" role="dialog" aria-label="Payment">
          <div className="pay-menu__head">
            <span className="pay-menu__title">{payment ? (payment.pending ? 'Awaiting payment' : 'Payment') : 'Take payment'}</span>
            <span className="pay-menu__amount">{payment ? formatMoney(payment.amount) : formatMoney(due)}</span>
          </div>

          {payment ? (
            <div className="pay-menu__body">
              <div className="pay-menu__recorded">
                <span className="pay-menu__recorded-icon">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span>
                  <span className="pay-menu__recorded-name">{payment.source ?? method!.label}</span>
                  <span className="pay-menu__recorded-sub">{payment.source ? method!.label : method!.sub}</span>
                </span>
                <Badge variant={payment.pending ? 'warning' : 'success'}>
                  {payment.pending ? 'Sent' : payment.method === 'external' ? 'External' : 'Online'}
                </Badge>
              </div>
              <div className="pay-menu__stamp">
                {payment.pending ? 'Sent at' : 'Recorded at'} {payment.at}
                {taker ? ` by ${taker.name}` : ''}
              </div>
              <button className="pay-menu__clear" type="button" onClick={clear}>
                <X size={13} strokeWidth={2.4} />
                {payment.pending ? 'Cancel this link' : 'Remove this payment'}
              </button>
            </div>
          ) : (
            <div className="pay-menu__body">
              <div className="pay-menu__label">Paid online with</div>
              {PAYMENT_METHODS.filter((m) => m.key !== 'external').map((m) => {
                const MIcon = METHOD_ICON[m.key];
                return (
                  <button
                    className="pay-menu__option"
                    type="button"
                    key={m.key}
                    onClick={() => record(m.key, due)}
                  >
                    <span className="pay-menu__recorded-icon">
                      <MIcon size={16} strokeWidth={2} />
                    </span>
                    <span>
                      <span className="pay-menu__recorded-name">{m.label}</span>
                      <span className="pay-menu__recorded-sub">{m.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </dd>
  );
}
