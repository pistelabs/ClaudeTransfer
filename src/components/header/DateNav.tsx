import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKeyOf, monthCells, monthLabel } from '../../lib/dates';
import { DAY_INFO, TODAY_IDX, useScheduler } from '../../store/useScheduler';
import { Button } from '../ui/primitives';
import { useEscape, useOutsideClick } from '../ui/hooks';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Date navigation: an arrow either side of the date itself, which opens a
 * calendar. The schedule holds one Mon–Sun week, so only that week's dates can
 * be navigated to — a further-out date would jump to its weekday in this week
 * and quietly show the wrong day. The months still page, so the calendar reads
 * as a calendar.
 */
export function DateNav() {
  const view = useScheduler((s) => s.view);
  const selDay = useScheduler((s) => s.selDay);
  const open = useScheduler((s) => s.datePicker);
  const navMonth = useScheduler((s) => s.navMonth);
  const shiftDate = useScheduler((s) => s.shiftDate);
  const toggle = useScheduler((s) => s.toggleDatePicker);
  const close = useScheduler((s) => s.closeDatePicker);
  const setNavMonth = useScheduler((s) => s.setNavMonth);
  const pickDay = useScheduler((s) => s.pickDay);
  const goToday = useScheduler((s) => s.goToday);

  const ref = useOutsideClick<HTMLDivElement>(open, close);
  useEscape(open, close);

  const isWeek = view === 'week';
  const label = isWeek
    ? `${DAY_INFO[0].date} – ${DAY_INFO[6].date}, ${DAY_INFO[6].year}`
    : `${DAY_INFO[selDay].long}, ${DAY_INFO[selDay].date}`;

  const cells = monthCells(navMonth);
  const selectedKey = dateKeyOf(DAY_INFO[selDay].iso);
  const tomorrowIdx = (TODAY_IDX + 1) % 7;

  return (
    <div className="date-nav popover-anchor" ref={ref}>
      <div className="segmented">
        <button
          className="segmented__btn segmented__btn--icon"
          type="button"
          title="Previous day"
          aria-label="Previous day"
          onClick={() => shiftDate(-1)}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        <button
          className="segmented__btn segmented__btn--date"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          title="Choose a date"
          onClick={toggle}
        >
          <CalendarDays size={15} strokeWidth={2} />
          {label}
        </button>

        <button
          className="segmented__btn segmented__btn--icon"
          type="button"
          title="Next day"
          aria-label="Next day"
          onClick={() => shiftDate(1)}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {open && (
        <div className="date-pop" role="dialog" aria-label="Choose a date">
          <div className="calendar__card date-pop__card">
            <div className="calendar__nav">
              <button
                className="calendar__nav-btn"
                type="button"
                title="Previous month"
                aria-label="Previous month"
                onClick={() => setNavMonth((n) => n - 1)}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <div className="calendar__month">{monthLabel(navMonth)}</div>
              <button
                className="calendar__nav-btn"
                type="button"
                title="Next month"
                aria-label="Next month"
                onClick={() => setNavMonth((n) => n + 1)}
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="calendar__grid">
              {WEEKDAYS.map((w) => (
                <div className="calendar__weekday" key={w}>
                  {w}
                </div>
              ))}
              {cells.map((c) => {
                if (c.blank) return <span className="calendar__cell calendar__cell--blank" key={c.key} />;
                // Selection is tracked by exact date, so paging months keeps the right cell lit.
                const isSel = !isWeek && c.key === selectedKey;
                // only the week the schedule has loaded can actually be shown
                const bookable = c.dayIdx !== null && !c.past && !c.next;
                const className = [
                  'calendar__cell',
                  c.past ? 'calendar__cell--past' : '',
                  !c.past && c.next ? 'calendar__cell--next' : '',
                  !isSel && c.isToday ? 'calendar__cell--today' : '',
                  isSel ? 'calendar__cell--sel' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    className={className}
                    type="button"
                    key={c.key}
                    disabled={!bookable}
                    aria-pressed={isSel}
                    onClick={() => bookable && pickDay(c.dayIdx!)}
                  >
                    {c.date}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="date-pop__note">Bookings load a week at a time</div>

          {/* The two dates anybody actually asks for, under the month. */}
          <div className="date-pop__shortcuts">
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => pickDay(tomorrowIdx)}>
              Tomorrow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
