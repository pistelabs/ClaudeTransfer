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

- **Drag to reschedule.** A 4px jitter threshold separates a click from a drag, so a plain
  click still opens the detail sheet. Drops snap to 15 minutes and can move between columns
  and days. A drop onto an occupied slot is allowed — staff double-book deliberately — and
  raises a non-blocking notice naming what it now overlaps.
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
- **The staff assessment unlocks on check-in.** Before the customer is checked in the
  measurements are read-only; the customer questionnaire can be filled at any time.
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
