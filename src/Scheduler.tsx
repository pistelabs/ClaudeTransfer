import { HeaderBar } from './components/header/HeaderBar';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { OverlapNotice } from './components/schedule/OverlapNotice';
import { WalkInColumn } from './components/schedule/WalkInColumn';
import { NewAppointmentSheet } from './components/booking/NewAppointmentSheet';
import { TeamMeetingDialog } from './components/booking/TeamMeetingDialog';
import { AppointmentDetailSheet } from './components/detail/AppointmentDetailSheet';
import { Toaster } from '@/components/ui/sonner';
import { useDayRollover } from './components/ui/useDayRollover';
import { useScheduler, type HydrateData } from './store/useScheduler';

/**
 * Puts real data into the console.
 *
 * A plain function rather than a prop so it can be called before anything is
 * mounted — the alternative is hydrating during the first render, which means
 * painting the seed for a frame first.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function hydrateScheduler(data: HydrateData): void {
  useScheduler.getState().hydrate(data);
}

/**
 * The whole console, as one component. Takes no props: everything it shows comes
 * from the store, which the host fills via {@link hydrateScheduler} before mount.
 */
export function Scheduler() {
  const showAdd = useScheduler((s) => s.showAdd);
  const showDetail = useScheduler((s) => s.showDetail);
  const showMeeting = useScheduler((s) => s.showMeeting);

  // the grid is drawn relative to today, so it has to notice today changing
  useDayRollover();

  return (
    <div className="app">
      <main className="app__main">
        <HeaderBar />
        <div className="app__body">
          <WalkInColumn />
          <ScheduleGrid />
        </div>
      </main>

      {/* raises its notices through the Toaster rather than rendering one itself */}
      <OverlapNotice />
      <Toaster />

      {showAdd && <NewAppointmentSheet />}
      {showDetail && <AppointmentDetailSheet />}
      {showMeeting && <TeamMeetingDialog />}
    </div>
  );
}
