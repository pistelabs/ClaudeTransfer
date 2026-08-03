import { HeaderBar } from './components/header/HeaderBar';
import { ScheduleGrid } from './components/schedule/ScheduleGrid';
import { OverlapNotice } from './components/schedule/OverlapNotice';
import { NewAppointmentSheet } from './components/booking/NewAppointmentSheet';
import { TeamMeetingDialog } from './components/booking/TeamMeetingDialog';
import { AppointmentDetailSheet } from './components/detail/AppointmentDetailSheet';
import { useScheduler } from './store/useScheduler';

export default function App() {
  const showAdd = useScheduler((s) => s.showAdd);
  const showDetail = useScheduler((s) => s.showDetail);
  const showMeeting = useScheduler((s) => s.showMeeting);

  return (
    <div className="app">
      <main className="app__main">
        <HeaderBar />
        <ScheduleGrid />
      </main>

      <OverlapNotice />

      {showAdd && <NewAppointmentSheet />}
      {showDetail && <AppointmentDetailSheet />}
      {showMeeting && <TeamMeetingDialog />}
    </div>
  );
}
