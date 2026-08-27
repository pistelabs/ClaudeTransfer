import { TriangleAlert, X } from 'lucide-react';
import { useScheduler } from '../../store/useScheduler';
import { Button } from '../ui/primitives';
import { useEscape } from '../ui/hooks';

/**
 * Raised after a manual move lands on top of existing bookings. Purely
 * informational: the move is already committed, nothing is blocked, and the
 * notice does not cover the grid — staff double-book deliberately and just need
 * to see that they have.
 */
export function OverlapNotice() {
  const notice = useScheduler((s) => s.overlapNotice);
  const dismiss = useScheduler((s) => s.dismissOverlapNotice);

  useEscape(!!notice, dismiss);

  if (!notice) return null;

  const { moved, clashes, fitter, day } = notice;

  return (
    <div className="overlap" role="status" aria-live="polite">
      <span className="overlap__icon">
        <TriangleAlert size={17} strokeWidth={2.2} />
      </span>

      <div className="overlap__body">
        <div className="overlap__title">Overlapping booking</div>
        <p className="overlap__lede">
          <b>{moved.customer}</b> moved to {moved.time} on {day}, which now overlaps{' '}
          {clashes.length === 1 ? 'another booking' : `${clashes.length} other bookings`} for {fitter}. The move
          has been saved.
        </p>
        <ul className="overlap__list">
          {clashes.map((c) => (
            <li key={c.id}>
              <span className="overlap__name">{c.customer}</span>
              <span className="overlap__time">{c.time}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={dismiss}>
        <X size={16} strokeWidth={2} />
      </Button>
    </div>
  );
}
