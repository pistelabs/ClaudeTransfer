import { Clock, CreditCard, X } from 'lucide-react';
import { formatMoney } from '../../lib/money';
import { useScheduler } from '../../store/useScheduler';
import { Button } from '@/components/ui/button';
import { useEscape } from '../ui/hooks';

/**
 * The booking is made; the money is the next question. It appears as soon as a
 * chargeable appointment is confirmed, because the customer is standing there —
 * asking now is the difference between taking the money and chasing it.
 *
 * Both endings are ordinary, so neither is destructive: Escape and the backdrop
 * take the same route as Pay later, and the booking stands either way.
 */
export function BookingPaymentDialog() {
  const prompt = useScheduler((s) => s.payPrompt);
  const later = useScheduler((s) => s.closePayPrompt);
  const send = useScheduler((s) => s.sendBookingToPos);

  useEscape(true, later);
  if (!prompt) return null;

  return (
    <div className="dialog-backdrop" style={{ zIndex: 70 }} onClick={later}>
      <div
        className="dialog"
        style={{ width: 430 }}
        role="dialog"
        aria-modal="true"
        aria-label="Take payment"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">Take payment</div>
            <div className="dialog__sub">
              {prompt.customer}
              {prompt.service ? ` · ${prompt.service}` : ''}
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={later}>
            <X size={17} strokeWidth={2} />
          </Button>
        </div>

        <div className="pay-prompt__total">
          <span className="pay-prompt__label">Total due</span>
          <span className="pay-prompt__amount">{formatMoney(prompt.amount)}</span>
        </div>

        <div className="dialog__actions">
          <Button variant="outline" size="lg" onClick={later}>
            <Clock size={16} strokeWidth={2} />
            Pay later
          </Button>
          <Button size="lg" onClick={send}>
            <CreditCard size={16} strokeWidth={2} />
            Send to POS
          </Button>
        </div>
      </div>
    </div>
  );
}
