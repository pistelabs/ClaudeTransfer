import { ChevronRight } from 'lucide-react';
import { STAFF } from '../../data/catalogue';
import { useScheduler } from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { useEscape } from '../ui/hooks';

/**
 * Blocks the booking sheet until a staff member claims the booking. Dismisses on
 * selection, on Escape and on Cancel; the sheet behind it is blurred, not hidden.
 */
export function WhosBookingGate() {
  const setBookedBy = useScheduler((s) => s.setBookedBy);
  const closeAdd = useScheduler((s) => s.closeAdd);

  useEscape(true, closeAdd);

  return (
    <div className="who" role="dialog" aria-modal="true" aria-label="Who's booking this?">
      <div className="who__card">
        <div className="who__title">Who&rsquo;s booking this?</div>
        <div className="who__sub">Select your name to attach it to this appointment.</div>
        <div className="who__list">
          {STAFF.map((s, si) => (
            <button className="who__row" type="button" key={s.name} onClick={() => setBookedBy(si)}>
              <Avatar initials={s.initials} color={s.dot} size={38} fontSize={13} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="who__name">{s.name}</span>
                <span className="who__role">{s.role}</span>
              </span>
              <ChevronRight size={17} strokeWidth={2} color="var(--n-300)" />
            </button>
          ))}
        </div>
        <button className="who__cancel" type="button" onClick={closeAdd}>
          Cancel
        </button>
      </div>
    </div>
  );
}
