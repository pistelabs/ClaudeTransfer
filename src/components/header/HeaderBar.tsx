import { ChevronDown, MapPin, Plus, TriangleAlert, UserCheck, Users } from 'lucide-react';
import { STAFF, STORE } from '../../data/catalogue';
import { conflictIds } from '../../lib/schedule';
import { useScheduler } from '../../store/useScheduler';
import { DateNav } from './DateNav';
import { GlobalSearch } from './GlobalSearch';
import { StaffFilter } from './StaffFilter';
import { useOutsideClick } from '../ui/hooks';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function HeaderBar() {
  const view = useScheduler((s) => s.view);
  const selDay = useScheduler((s) => s.selDay);
  const appts = useScheduler((s) => s.appts);
  const staffFilter = useScheduler((s) => s.staffFilter);
  const addMenu = useScheduler((s) => s.addMenu);
  const setView = useScheduler((s) => s.setView);
  const openAdd = useScheduler((s) => s.openAdd);
  const toggleAddMenu = useScheduler((s) => s.toggleAddMenu);
  const closeAddMenu = useScheduler((s) => s.closeAddMenu);
  const openMeeting = useScheduler((s) => s.openMeeting);
  const openQueueAdd = useScheduler((s) => s.openQueueAdd);

  const isWeek = view === 'week';
  const addRef = useOutsideClick<HTMLDivElement>(addMenu, closeAddMenu);

  // Only conflicts inside the current view are worth badging.
  const visible = staffFilter.length > 0 ? appts.filter((a) => staffFilter.includes(a.s)) : appts;
  const inView = isWeek ? visible : visible.filter((a) => a.d === selDay);
  const clashing = conflictIds(inView).size;
  const pairs = Math.round(clashing / 2);
  const conflictMsg =
    pairs === 1
      ? `1 double-booking on this ${isWeek ? 'week' : 'day'}`
      : `${pairs} double-bookings on this ${isWeek ? 'week' : 'day'}`;

  return (
    <header className="header">
      <span className="store-pill" title={`${STORE.name} · ${STORE.location}`}>
        <MapPin size={13} strokeWidth={2.2} />
        {STORE.location}
      </span>

      <GlobalSearch />

      <DateNav />

      <div className="header__controls">
        {pairs > 0 && (
          <span className="conflict-badge" title={conflictMsg}>
            <TriangleAlert size={14} strokeWidth={2} />
            {pairs}
          </span>
        )}

        <ToggleGroup
          className="view-toggle"
          type="single"
          value={isWeek ? 'week' : 'day'}
          aria-label="Calendar view"
          // a segmented control always has one of the two chosen; ignore a
          // deselecting click rather than leaving the schedule with no view
          onValueChange={(v) => v && setView(v as 'day' | 'week')}
        >
          <ToggleGroupItem className="view-toggle__btn" value="day">
            Day
          </ToggleGroupItem>
          <ToggleGroupItem className="view-toggle__btn" value="week">
            Week
          </ToggleGroupItem>
        </ToggleGroup>

        <StaffFilter />

        <div className="popover-anchor" ref={addRef}>
          <button className="add-btn" type="button" onClick={openAdd}>
            <Plus size={16} strokeWidth={2.2} />
            Add
          </button>
          <button
            className="add-btn__chevron"
            type="button"
            title="More booking types"
            aria-label="More booking types"
            aria-expanded={addMenu}
            onClick={toggleAddMenu}
          >
            <ChevronDown size={15} strokeWidth={2.2} />
          </button>

          {addMenu && (
            <div className="add-menu">
              <button className="add-menu__item" type="button" onClick={openQueueAdd}>
                <span className="add-menu__icon">
                  <UserCheck size={15} strokeWidth={2} />
                </span>
                <span>
                  <span className="add-menu__title">Check in a walk-in</span>
                  <span className="add-menu__sub">Queue them with no time yet</span>
                </span>
              </button>
              <button className="add-menu__item" type="button" onClick={openMeeting}>
                <span className="add-menu__icon">
                  <Users size={15} strokeWidth={2} />
                </span>
                <span>
                  <span className="add-menu__title">Team meeting</span>
                  <span className="add-menu__sub">Block time across {STAFF.length} fitters</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
