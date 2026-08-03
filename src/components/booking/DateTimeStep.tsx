import { ChevronLeft, ChevronRight, Info, Minus, Plus, RotateCcw } from 'lucide-react';
import { STAFF, serviceById } from '../../data/catalogue';
import { monthCells, monthLabel } from '../../lib/dates';
import { bufferClashesFor, slotsFor } from '../../lib/schedule';
import { durationLabel, fmtTime, parseTime, rangeLabel } from '../../lib/time';
import { DAY_INFO, MAX_DURATION, MIN_DURATION, useScheduler } from '../../store/useScheduler';
import { Button, Label } from '../ui/primitives';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function DateTimeStep() {
  const dateKey = useScheduler((s) => s.form.dateKey);
  const svcStep = useScheduler((s) => s.svcStep);
  const monthOffset = useScheduler((s) => s.monthOffset);
  const pickDate = useScheduler((s) => s.pickDate);
  const setMonthOffset = useScheduler((s) => s.setMonthOffset);

  const showTime = svcStep === 'time';
  const cells = monthCells(monthOffset);

  return (
    <div className="book-step">
      <div className="calendar">
        <div className="section-label">Select a date</div>
        <div className="calendar__card">
          <div className="calendar__nav">
            <button
              className="calendar__nav-btn"
              type="button"
              title="Previous month"
              aria-label="Previous month"
              onClick={() => setMonthOffset((n) => n - 1)}
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <div className="calendar__month">{monthLabel(monthOffset)}</div>
            <button
              className="calendar__nav-btn"
              type="button"
              title="Next month"
              aria-label="Next month"
              onClick={() => setMonthOffset((n) => n + 1)}
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
              const isSel = c.key === dateKey;
              const bookable = c.dayIdx !== null && !c.past;
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
                  onClick={() => bookable && pickDate(c.dayIdx!, c.key)}
                >
                  {c.date}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showTime && <TimeSlots />}
    </div>
  );
}

function TimeSlots() {
  const form = useScheduler((s) => s.form);
  const appts = useScheduler((s) => s.appts);
  const rescheduleId = useScheduler((s) => s.rescheduleId);
  const pickTime = useScheduler((s) => s.pickTime);

  const staffSel = form.staff;
  const dur = form.dur;
  const current = parseTime(form.time);
  const svc = serviceById(form.service);
  const cand = { id: null, d: form.day, s: staffSel ?? 0, st: current, du: dur, bb: svc?.bb ?? 0, ba: svc?.ba ?? 0 };

  const slots = slotsFor(appts, staffSel, form.day, dur, rescheduleId);
  const openCount = slots.filter((s) => s.ok).length;
  const valid = slots.some((s) => s.min === current && s.ok);
  const day = DAY_INFO[form.day];
  const who = staffSel === null ? 'any fitter' : STAFF[staffSel].name.split(' ')[0];

  const bufferHit = staffSel === null ? [] : bufferClashesFor(appts, cand);

  return (
    <div className="timeslots">
      <DurationStepper />

      <div className="section-label">Select a time</div>
      <div className="timeslots__summary">
        {openCount} open {openCount === 1 ? 'slot' : 'slots'} · {who} · {day.short}
      </div>

      <div className={`timeslots__window${valid ? '' : ' timeslots__window--invalid'}`}>
        {rangeLabel(current, current + dur)}&nbsp; · &nbsp;{durationLabel(dur)}
        {valid ? '' : '  ·  not available'}
      </div>

      {bufferHit.length > 0 && (
        <div className="buffer-note">
          <Info size={14} strokeWidth={2} style={{ flex: '0 0 auto', marginTop: 1 }} />
          Runs into the buffer around {bufferHit[0].c} — not offered online, allowed in store.
        </div>
      )}

      {openCount === 0 ? (
        <div className="empty-state" style={{ marginTop: 9 }}>
          <div className="empty-state__title">No open times</div>
          <div className="empty-state__body">
            No {durationLabel(dur)} gaps {staffSel === null ? '' : `for ${who} `}on {day.short} {day.date} — try
            another day or staff member.
          </div>
        </div>
      ) : (
        <div className="timeslots__grid">
          {slots.map((sl) => {
            const sel = sl.min === current;
            // Buffer-only clashes stay clickable: in-store staff may override them.
            const inBuffer =
              sl.ok &&
              staffSel !== null &&
              bufferClashesFor(appts, { ...cand, st: sl.min }).length > 0;
            const className = [
              'slot',
              !sl.ok ? 'slot--closed' : '',
              sl.ok && inBuffer && !sel ? 'slot--buffer' : '',
              sel ? 'slot--sel' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                className={className}
                type="button"
                key={sl.min}
                disabled={!sl.ok}
                aria-pressed={sel}
                onClick={() => pickTime(sl.min)}
              >
                {fmtTime(sl.min)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Adjusts how long this one booking runs, independently of the service's
 * standard length. Sits above the time slots because changing it changes which
 * start times are still open.
 */
function DurationStepper() {
  const dur = useScheduler((s) => s.form.dur);
  const service = useScheduler((s) => s.form.service);
  const setDuration = useScheduler((s) => s.setDuration);

  const standard = serviceById(service)?.du ?? null;
  const adjusted = standard !== null && dur !== standard;

  return (
    <div className="duration">
      <div className="duration__head">
        <Label htmlFor="booking-duration">Duration</Label>
        {adjusted && (
          <button className="duration__reset" type="button" onClick={() => setDuration(standard)}>
            <RotateCcw size={12} strokeWidth={2.2} />
            Reset to {durationLabel(standard)}
          </button>
        )}
      </div>

      <div className="duration__row">
        <div className="duration__stepper">
          <Button
            variant="ghost"
            size="icon"
            className="duration__btn"
            aria-label="Shorten by 15 minutes"
            disabled={dur <= MIN_DURATION}
            onClick={() => setDuration(dur - 15)}
          >
            <Minus size={15} strokeWidth={2.4} />
          </Button>
          <output className="duration__value" id="booking-duration">
            {durationLabel(dur)}
          </output>
          <Button
            variant="ghost"
            size="icon"
            className="duration__btn"
            aria-label="Extend by 15 minutes"
            disabled={dur >= MAX_DURATION}
            onClick={() => setDuration(dur + 15)}
          >
            <Plus size={15} strokeWidth={2.4} />
          </Button>
        </div>

        <span className="duration__note">
          {adjusted
            ? `Adjusted for this booking · standard is ${durationLabel(standard)}`
            : standard !== null
              ? 'Standard length for this service'
              : 'Adjust in 15-minute steps'}
        </span>
      </div>
    </div>
  );
}
