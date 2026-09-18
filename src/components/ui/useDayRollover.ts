import { useEffect } from 'react';
import { useScheduler } from '../../store/useScheduler';

/**
 * Watches for the calendar date changing under an open tab.
 *
 * A booking stores the moment it starts, but where that moment sits on the grid
 * — which column, how many weeks out — is measured from today. A console left
 * open overnight would otherwise keep drawing yesterday's week, with "today"
 * highlighted on the wrong column.
 *
 * Polled rather than timed to midnight, because a laptop that sleeps through
 * midnight never fires the timer it was owed.
 */
export function useDayRollover(intervalMs = 60_000) {
  const refreshToday = useScheduler((s) => s.refreshToday);

  useEffect(() => {
    let last = new Date().toDateString();
    const tick = () => {
      const now = new Date().toDateString();
      if (now === last) return;
      last = now;
      refreshToday();
    };
    const id = setInterval(tick, intervalMs);
    // also catches a machine waking from sleep on a later day
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refreshToday, intervalMs]);
}
