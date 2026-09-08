import { useState } from 'react';
import { Banknote, ChevronDown, CreditCard, Link2 } from 'lucide-react';
import { EXTERNAL_SOURCES } from '../../data/catalogue';
import { formatMoney } from '../../lib/schedule';
import { useScheduler } from '../../store/useScheduler';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DetailInfo } from './useDetail';

/**
 * Closing the appointment out. Sending it to the POS is the usual ending, so it
 * keeps the button; the two other endings — a payment link for somebody who is
 * leaving, and money that arrived some other way — sit behind the chevron.
 *
 * One popover rather than a menu that hands over to a form: recording an external
 * payment needs a field and two buttons, which is a dialog's job, and a panel that
 * swaps its own contents has no handoff between layers to get wrong.
 */
export function PosActions({ detail }: { detail: DetailInfo }) {
  const open = useScheduler((s) => s.posMenu);
  const toggle = useScheduler((s) => s.togglePosMenu);
  const close = useScheduler((s) => s.closePosMenu);
  const finish = useScheduler((s) => s.finishComplete);
  const sendLink = useScheduler((s) => s.sendPaymentLink);
  const recordExternal = useScheduler((s) => s.recordExternalPayment);

  const [source, setSource] = useState<string | null>(null);
  const due = detail.totals.due;

  return (
    <div className="complete__pos">
      <Popover
        open={open}
        onOpenChange={(v) => {
          setSource(null);
          return v ? toggle() : close();
        }}
      >
        <ButtonGroup className="split-btn">
          <Button size="lg" className="complete__action split-btn__main" onClick={finish}>
            <CreditCard size={16} strokeWidth={2} />
            Send to POS
          </Button>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="split-btn__chevron"
              title="Other payment options"
              aria-label="Other payment options"
            >
              <ChevronDown size={15} strokeWidth={2.4} />
            </Button>
          </PopoverTrigger>
        </ButtonGroup>

        <PopoverContent
          align="end"
          side="top"
          className="pos-menu"
          aria-label={source === null ? 'Other payment options' : 'External payment'}
        >
          {source === null ? (
            <>
              <div className="pos-menu__title">Other payment options</div>

              <button className="pos-menu__item" type="button" onClick={() => sendLink(due)}>
                <span className="pos-menu__icon">
                  <Link2 size={16} strokeWidth={2} />
                </span>
                <span>
                  <span className="pos-menu__name">Send payment link</span>
                  <span className="pos-menu__sub">
                    {formatMoney(due)} to pay — the booking waits until it clears
                  </span>
                </span>
              </button>

              <button className="pos-menu__item" type="button" onClick={() => setSource(EXTERNAL_SOURCES[0])}>
                <span className="pos-menu__icon">
                  <Banknote size={16} strokeWidth={2} />
                </span>
                <span>
                  <span className="pos-menu__name">Add external payment</span>
                  <span className="pos-menu__sub">Money taken outside the shop’s tills</span>
                </span>
              </button>
            </>
          ) : (
            <div className="pos-menu__form">
              <div className="pos-menu__title">External payment</div>
              <Label htmlFor="pos-source">Where it came from</Label>
              <select
                className="equip__input"
                id="pos-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {EXTERNAL_SOURCES.map((x) => (
                  <option value={x} key={x}>
                    {x}
                  </option>
                ))}
              </select>

              <div className="pos-menu__amount">
                <span>Recording</span>
                <strong>{formatMoney(due)}</strong>
              </div>

              <div className="pos-menu__form-actions">
                <Button variant="outline" size="sm" onClick={() => setSource(null)}>
                  Back
                </Button>
                <Button size="sm" onClick={() => recordExternal(source, due)}>
                  Record payment
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
