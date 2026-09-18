import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKeyOf, monthCells, weekAt } from '../../lib/dates';
import { useScheduler } from '../../store/useScheduler';
import { Button } from '@/components/ui/button';
import { MonthCaption } from '@/components/ui/MonthCaption';
import { useEscape, useOutsideClick } from '../ui/hooks';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Date navigation: an arrow either side of the date itself, which opens a
 * calendar. Any date can be picked, forwards or back; the arrows step a day, or
 * a week in week view, rolling over the week boundary.
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
  const weekOffset = useScheduler((s) => s.weekOffset);
  const goToday = useScheduler((s) => s.goToday);

  const ref = useOutsideClick<HTMLDivElement>(open, close);
  useEscape(open, close);

  const isWeek = view === 'week';
  const week = weekAt(weekOffset);
  const label = isWeek
    ? `${week[0].date} – ${week[6].date}, ${week[6].year}`
    : `${week[selDay].long}, ${week[selDay].date}, ${week[selDay].year}`;

  const cells = monthCells(navMonth);
  const selectedKey = dateKeyOf(week[selDay].iso);
  // tomorrow rolls into next week when today is a Sunday
  const todayIdx = useScheduler((s) => s.todayIdx);
  // In week view the whole week is on screen, so this week counts as today.
  const onToday = weekOffset === 0 && (isWeek || selDay === todayIdx);
  const tomorrow = todayIdx === 6 ? { d: 0, w: 1 } : { d: todayIdx + 1, w: 0 };

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
          {/* says the date opens something, and which way it opens */}
          <ChevronDown className="segmented__caret" size={14} strokeWidth={2.2} />
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

        {/* The way back from wherever the schedule has wandered to. It keeps its
            place when today is already showing rather than appearing and
            vanishing under the pointer, which would shift the whole header. */}
        <button
          className="segmented__btn segmented__btn--text segmented__btn--today"
          type="button"
          disabled={onToday}
          title={onToday ? `Already showing ${isWeek ? 'this week' : 'today'}` : 'Back to today'}
          onClick={goToday}
        >
          Today
        </button>
      </div>

      {open && (
        <div className="date-pop" role="dialog" aria-label="Choose a date">
          <div className="calendar__card date-pop__card">
            <MonthCaption offset={navMonth} onOffset={(next) => setNavMonth(() => next)} />

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
                const bookable = !c.blank;
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
                    onClick={() => bookable && pickDay(c.dayIdx!, c.weekOffset)}
                  >
                    {c.date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The two dates anybody actually asks for, under the month. */}
          <div className="date-pop__shortcuts">
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => pickDay(tomorrow.d, tomorrow.w)}>
              Tomorrow
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
