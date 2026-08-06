import { useLayoutEffect, useRef } from 'react';
import { ChevronLeft, Mountain, TriangleAlert, UserCheck, X } from 'lucide-react';
import { STAFF, STORE, serviceById } from '../../data/catalogue';
import { collisionsFor, slotsFor } from '../../lib/schedule';
import { durationLabel, parseTime, rangeLabel } from '../../lib/time';
import {
  DAY_INFO,
  seatMissingTotal,
  useScheduler,
  type SchedulerStore,
} from '../../store/useScheduler';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/primitives';
import { useEscape } from '../ui/hooks';
import { CustomerStep } from './CustomerStep';
import { DateTimeStep, DurationStepper } from './DateTimeStep';
import { NewCustomerDialog } from './NewCustomerDialog';
import { ServicePicker } from './ServicePicker';
import { WhosBookingGate } from './WhosBookingGate';

export function NewAppointmentSheet() {
  const store = useScheduler((s) => s as SchedulerStore);
  const {
    sheetPage,
    svcStep,
    form,
    showWho,
    showNewCust,
    bookedBy,
    rescheduleId,
    queueAdd,
    appts,
    closeAdd,
    setSheetPage,
    saveAppt,
    saveWalkIn,
    showWhoGate,
  } = store;

  // a nested popover claims Escape first
  useEscape(!showWho && !showNewCust && !store.staffOpen, closeAdd);

  // Each page is a fresh form, so start it at the top rather than inheriting the
  // other page's scroll. Focus has to move too: React reuses the footer button
  // between pages, and the browser scrolls whatever is focused back into view,
  // which would undo the reset. Focusing the panel also lands assistive tech at
  // the top of the new step.
  const bodyRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.focus({ preventScroll: true });
  }, [sheetPage]);

  const onBook = sheetPage === 'book';
  const startMin = parseTime(form.time);
  const slots = slotsFor(appts, form.staff, form.day, form.dur, rescheduleId);
  const slotValid = svcStep === 'time' && slots.some((s) => s.min === startMin && s.ok);

  // A clash warns rather than blocks — in-store staff may double-book deliberately.
  // A queue entry has no time, so it can't clash with anything.
  const clashes =
    !queueAdd && svcStep === 'time' && form.staff !== null
      ? collisionsFor(appts, { id: rescheduleId, d: form.day, s: form.staff, st: startMin, du: form.dur })
      : [];
  const clash = clashes.length > 0;
  const clashMsg = clash
    ? `${STAFF[form.staff!].name.split(' ')[0]} already has ${clashes[0].c} at ${rangeLabel(
        clashes[0].st,
        clashes[0].st + clashes[0].du,
      )}`
    : '';

  // A queue entry stops at the service: no date, no time, no fitter to validate.
  const canContinue = queueAdd ? !!form.service : !!form.service && svcStep === 'time' && slotValid;
  const missing = seatMissingTotal(store);
  const svc = serviceById(form.service);
  const booker = bookedBy === null ? null : STAFF[bookedBy];
  const title = queueAdd ? 'Check in a walk-in' : rescheduleId ? 'Reschedule appointment' : 'New appointment';

  const bookMsg = !form.service
    ? 'Choose a service'
    : queueAdd
      ? 'Continue to customer details'
      : svcStep !== 'time'
        ? 'Pick a date and time'
        : slotValid
          ? clash
            ? 'Overlaps an existing booking'
            : 'Continue to customer details'
          : 'Pick an available time';

  const detailsMsg = !form.customer.trim()
    ? 'Select a customer to continue'
    : missing === 0
      ? 'All required information captured'
      : `${missing} required field${missing === 1 ? '' : 's'} still empty`;

  return (
    <>
      <div className="backdrop" onClick={closeAdd}>
        <div
          className={`sheet${showWho ? ' sheet--gated' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sheet__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div className="sheet__title">{title}</div>
              <span className="sheet__brand">
                <Mountain size={13} strokeWidth={2} />
                {STORE.name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {booker && (
                <button
                  className="sheet__booked-by"
                  type="button"
                  title="Change who's booking"
                  onClick={showWhoGate}
                >
                  <Avatar initials={booker.initials} color={booker.dot} size={28} fontSize={10.5} />
                  <span className="sheet__booked-by-name">{booker.name}</span>
                </button>
              )}
              <Button variant="ghost" size="icon" aria-label="Close" onClick={closeAdd}>
                <X size={17} strokeWidth={2} />
              </Button>
            </div>
          </div>

          <div className="sheet__body" ref={bodyRef} tabIndex={-1}>
            {onBook ? (
              <>
                <ServicePicker />
                {/* A walk-in has no date or time — how long to allow for them is the
                    only scheduling decision left, and it can still be adjusted later. */}
                {queueAdd ? (
                  form.service !== null && (
                    <div className="queue-note">
                      <UserCheck size={15} strokeWidth={2} style={{ flex: '0 0 auto', marginTop: 1 }} />
                      <div>
                        <div className="queue-note__title">They wait in the check-in queue</div>
                        <div className="queue-note__body">
                          No fitter or time is set now. Drag them onto a column when somebody is free.
                        </div>
                      </div>
                      <DurationStepper />
                    </div>
                  )
                ) : (
                  // Date only appears once a service is chosen; time sits beside it.
                  svcStep !== 'service' && <DateTimeStep />
                )}
              </>
            ) : (
              <>
                <div className="summary">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        flex: '0 0 auto',
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: 'var(--primary)',
                      }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span className="summary__label">Service</span>
                      <span className="summary__value">{svc?.name ?? '—'}</span>
                    </span>
                  </div>
                  <div className="summary__divider" />
                  {queueAdd ? (
                    // No date, time or fitter to summarise — that is the point of a queue entry.
                    <>
                      <div>
                        <span className="summary__label">Waiting since</span>
                        <span className="summary__value">Now</span>
                      </div>
                      <div className="summary__divider" />
                      <div>
                        <span className="summary__label">Expected</span>
                        <span className="summary__value">{durationLabel(form.dur)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="summary__label">Date</span>
                        <span className="summary__value">
                          {DAY_INFO[form.day].short} {DAY_INFO[form.day].date}
                        </span>
                      </div>
                      <div className="summary__divider" />
                      <div>
                        <span className="summary__label">Time</span>
                        <span className="summary__value">{rangeLabel(startMin, startMin + form.dur)}</span>
                      </div>
                      <div className="summary__divider" />
                      <div>
                        <span className="summary__label">Fitter</span>
                        <span className="summary__value">
                          {form.staff === null ? 'Unassigned' : STAFF[form.staff].name}
                        </span>
                      </div>
                    </>
                  )}
                  <div style={{ flex: 1 }} />
                  <Button variant="outline" size="sm" onClick={() => setSheetPage('book')}>
                    Change
                  </Button>
                </div>

                <div className="section-label">Customer</div>
                <CustomerStep />
              </>
            )}

            {clash && (
              <div className="clash">
                <TriangleAlert size={16} strokeWidth={2} color="var(--danger)" style={{ flex: '0 0 auto', marginTop: 1 }} />
                <div>
                  <div className="clash__title">Double-booking</div>
                  <div className="clash__body">{clashMsg}</div>
                </div>
              </div>
            )}
          </div>

          <div className="sheet__footer">
            <span
              className={`sheet__footer-msg${
                onBook
                  ? clash
                    ? ' sheet__footer-msg--warn'
                    : ''
                  : missing === 0
                    ? ' sheet__footer-msg--ok'
                    : ''
              }`}
            >
              {onBook ? bookMsg : detailsMsg}
            </span>
            <div className="sheet__footer-actions">
              {onBook ? (
                <>
                  <Button variant="outline" size="lg" onClick={closeAdd}>
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    className={canContinue ? 'is-ready' : undefined}
                    disabled={!canContinue}
                    onClick={() => (rescheduleId ? saveAppt() : setSheetPage('details'))}
                  >
                    {rescheduleId ? 'Save new time' : 'Next'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="lg" onClick={() => setSheetPage('book')}>
                    <ChevronLeft size={15} strokeWidth={2} />
                    Back
                  </Button>
                  <Button
                    variant={clash ? 'destructive' : 'default'}
                    size="lg"
                    disabled={missing > 0}
                    onClick={queueAdd ? saveWalkIn : saveAppt}
                  >
                    {queueAdd ? 'Add to queue' : clash ? 'Schedule anyway' : 'Confirm booking'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showWho && <WhosBookingGate />}
      {showNewCust && <NewCustomerDialog />}
    </>
  );
}
