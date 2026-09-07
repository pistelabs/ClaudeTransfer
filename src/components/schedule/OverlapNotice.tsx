import { useEffect, useRef } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { useScheduler } from '../../store/useScheduler';
import { Button } from '@/components/ui/button';

/**
 * Raised after a manual move lands on top of existing bookings. Purely
 * informational: the move is already committed, nothing is blocked, and the
 * notice does not cover the grid — staff double-book deliberately and just need
 * to see that they have.
 *
 * Renders nothing itself. The notice goes through Sonner so a second move stacks
 * behind the first rather than replacing it, and so one nobody dismisses clears
 * itself; the markup and styling are unchanged, pushed with `toast.custom`.
 */
export function OverlapNotice() {
  const notice = useScheduler((s) => s.overlapNotice);
  const dismiss = useScheduler((s) => s.dismissOverlapNotice);
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!notice) {
      shown.current = null;
      return;
    }
    // the store holds one notice at a time; only push each one once
    const key = `${notice.moved.id}:${notice.moved.time}:${notice.clashes.map((c) => c.id).join(',')}`;
    if (shown.current === key) return;
    shown.current = key;

    const { moved, clashes, fitter, day } = notice;
    toast.custom(
      (id) => (
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

          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss"
            onClick={() => {
              toast.dismiss(id);
              dismiss();
            }}
          >
            <X size={16} strokeWidth={2} />
          </Button>
        </div>
      ),
      { onDismiss: dismiss, onAutoClose: dismiss },
    );
  }, [notice, dismiss]);

  return null;
}
