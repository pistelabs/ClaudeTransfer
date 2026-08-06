# Bootfit Scheduler

A staff-facing scheduling console for a ski bootfitting studio, built in React from the
`Bootfitting Appointment Scheduler` design handoff.

Fitters and front-desk staff use it to see the fitting bays for a day or a week, book
appointments against a service catalogue, capture what a fitter needs before the appointment,
run the appointment itself, then close it out to the POS or the workshop queue.

## Running it

Needs Node **^20.19 || >=22.12** — the version Vite, oxlint and rolldown require.
`nvm use` picks it up from `.nvmrc`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run preview  # serve the built bundle
npm run lint
```

Fonts (Roboto, Geist) are fetched from Google Fonts at runtime, so the first load wants
network access. Offline the app still runs, just in a system sans-serif.

## Stack

- **React 19 + TypeScript**, bundled with Vite.
- **Zustand** for the scheduler store. The screens share a lot of interdependent state
  (drag, selection, sheet steps, per-seat and per-customer answers), so it lives in one
  store rather than being threaded through props.
- **Plain CSS** with design tokens as custom properties. The design specifies exact pixel
  values (11.5px type, 34px controls, 64px hour rows), so hand-written CSS tracks it more
  honestly than utility classes would.
- **lucide-react** for icons.

## Layout

```
src/
  data/catalogue.ts     staff, services, questions, equipment types — the shop's catalogue
  data/seed.ts          seeded bookings, customers and captured records
  lib/time.ts           grid geometry and time formatting
  lib/dates.ts          the real Mon–Sun week, month grid, initials
  lib/schedule.ts       overlap packing, conflicts, buffers, availability, money
  store/useScheduler.ts all application state and actions
  components/
    header/             date nav, global search, staff filter, split Add button
    schedule/           the grid: columns, bands, blocks, buffers, drag and selection
    booking/            new-appointment sheet and its steps, team meeting, new customer
    detail/             appointment detail sheet, its three tabs, complete dialog
    ui/                 avatar, question field, outside-click and escape hooks
  styles/               tokens plus one stylesheet per surface
```

## Where the data comes from

Everything is seeded in memory and meant to be replaced with real API calls. The backend
needs to supply: staff with shifts and breaks, the service catalogue with
durations/prices/buffers/seat counts, per-type required-at-booking field definitions,
customer and staff question sets, equipment types with their applicable service groups,
customers, appointments, check-ins, captured records, the workshop queue and POS totals.

`data/seed.ts` shifts the seeded week so the busy day always lands on today, which keeps
the "now" line and the Today/Upcoming/Past pills meaningful whenever you open it.

## Behaviour worth knowing

- **Walk-ins queue on the left.** People who check in arrive with no day, time or fitter, so
  they are held apart from the schedule in a collapsible column rather than forced into the
  grid. Opening one shows the same three tabs as any booking, minus the scheduling facts,
  with the check-in stamp in place of the booking line. Drag one onto a column to book it in:
  the slot previews as a dashed block, and the drop turns it into an ordinary appointment
  that keeps the time it checked in. In week view a column is a day rather than a fitter, so
  the drop takes the first fitter free at that time.
- **Staff can check somebody in too**, from the + on the queue or the Add menu. It is the
  booking sheet with the date, time and fitter step removed — only the service, how long to
  allow, and who they are — because that is exactly the decision being deferred. Required
  at-booking fields still apply. Every stamp records its source: `Self check in` for the
  portal, `Maya Torres check in` for the desk, with the date as well as the time, since a
  queue entry can outlive the day it was made.
- **Drag to reschedule.** A 4px jitter threshold separates a click from a drag, so a plain
  click still opens the detail sheet. Drops snap to 15 minutes and can move between columns
  and days. A drop onto an occupied slot is allowed — staff double-book deliberately — and
  raises a non-blocking notice naming what it now overlaps.
- **Duration is per booking.** Duration and bootfitter sit on one row above the slots, so a
  booking can run longer or shorter than its service's standard length. Changing either
  re-filters the open start times immediately, and a one-click reset restores the standard.
- **Choosing a service scrolls to the date.** The date/time step only exists once a service
  is picked, so it scrolls itself into view on mount rather than appearing off the bottom of
  the sheet. Honours `prefers-reduced-motion`.
- **Click or drag empty space.** A click books a 15-minute anchor that expands to the chosen
  service's full duration; a drag sweeps a custom window. Either way the sheet opens
  prefilled with day, fitter, start and duration.
- **Buffers** are drawn as hatched, dotted bands hard against the block so they read as
  protected time rather than bookable work. A slot that only clashes with a buffer stays
  clickable and is flagged amber — online bookings must respect it, in-store staff may not.
- **Double-booking warns, it does not block.** The sheet shows the clashing appointment and
  the confirm button turns rose, but the booking can still be forced through.
- **Answers are per person, not per booking.** A multi-customer booking keeps its own
  required-at-booking answers, fitting questionnaire, staff assessment, check-in and
  equipment record for each person on it.
- **Both sides of the Fitting tab are the same form.** Customer questions and the staff
  assessment share a card, a labelled field grid and a completion action, and either can be
  filled at any point. Check-in timestamps the arrival but no longer gates the assessment.
- **Column widths persist per column** and per view; the shift-hours label drops out below
  190px so name and role keep priority. Columns share any spare width so a wide window
  fills edge to edge, and scroll horizontally when it is narrow.

## Deviations from the handoff

- The handoff's prose describes the header as date navigation on the left and search in the
  centre. The prototype and every reference screenshot put search on the left and the date
  navigation in the centre; this build follows the prototype and screenshots.
- The handoff's interaction notes say a drop onto an occupied slot is rejected. In practice
  staff move bookings on top of each other on purpose, so this build allows the move and
  raises an informational notice instead. The clash is still surfaced everywhere it was
  before: rose hatching on both blocks, a warning icon, and the header conflict badge.
- The handoff locks the staff assessment until the customer is checked in. Both sides of the
  Fitting tab are now the same editable form, so that lock is gone; the card still says the
  assessment is recorded by the fitter during the appointment.
