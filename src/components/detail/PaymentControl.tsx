import { Banknote, Check, Clock, CreditCard, Link2, Store, Wallet, X } from 'lucide-react';
import { PAYMENT_METHODS, paymentMethod, staffById } from '../../data/catalogue';
import { formatMoney } from '../../lib/money';
import { useScheduler } from '../../store/useScheduler';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

  const { payment, due } = totals;
  const method = payment ? paymentMethod(payment.method) : null;
  const Icon = payment ? METHOD_ICON[payment.method] : CreditCard;
  const taker = payment && payment.by !== null ? staffById(payment.by) : null;
  // Two things can be outstanding: a link sent to the customer, and a charge
  // waiting at the till. Both are money that has not arrived, but they are
  // cancelled in different places, so they are not described as the same thing.
  const link = payment?.method === 'shopify-link';

  return (
    <Popover open={open} onOpenChange={(v) => (v ? toggle() : close())}>
      <PopoverTrigger asChild>
        <button
          className={`pay-btn${payment ? (payment.pending ? ' pay-btn--pending' : ' pay-btn--paid') : ''}`}
          type="button"
          title={
            payment
              ? payment.pending
                ? link
                  ? `Payment link sent at ${payment.at} — click to change`
                  : `Sent to the till at ${payment.at} — click to change`
                : `Paid by ${payment.source ?? method!.label} at ${payment.at} — click to change`
              : 'Record how this was paid'
          }
        >
          {payment?.pending && <Clock size={13} strokeWidth={2.4} />}
          {payment && !payment.pending && <Check size={13} strokeWidth={2.8} />}
          {totals.paid}
        </button>
      </PopoverTrigger>

      {/* the Paid figure sits at the left of the bill bar, so the popover opens rightwards */}
      <PopoverContent align="start" side="top" className="pay-menu" aria-label="Payment">
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
                  {payment.pending
                    ? link
                      ? 'Sent'
                      : 'At the till'
                    : payment.method === 'external'
                      ? 'External'
                      : 'Online'}
                </Badge>
              </div>
              <div className="pay-menu__stamp">
                {payment.pending ? 'Sent at' : 'Recorded at'} {payment.at}
                {taker ? ` by ${taker.name}` : ''}
              </div>
              <button className="pay-menu__clear" type="button" onClick={clear}>
                <X size={13} strokeWidth={2.4} />
                {payment.pending ? (link ? 'Cancel this link' : 'Cancel this charge') : 'Remove this payment'}
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
      </PopoverContent>
    </Popover>
  );
}
