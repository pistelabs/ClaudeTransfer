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
customer and staff question sets, equipment types with their brands, sizes and applicable
service groups,
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
- **A booking can skip the date and time entirely.** The date step offers "add to the
  check-in queue", so an ordinary new appointment — started from Add, the queue's +, or the
  Add menu — can be parked in the queue instead of scheduled, and switched back without
  losing what has been captured. It is the same sheet either way: same service picker, same
  customer step, same required-at-booking fields; only the calendar and slots are replaced,
  by how long to allow for them. Rescheduling never offers it, since a booking with a time
  is not a walk-in.
- **Check-in stamps record their source**: `Self check in` for the portal, `Maya Torres
  check in` for the desk, with the date as well as the time, since a queue entry can outlive
  the day it was made.
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
- **A booking can have more than one fitter.** Some work needs two pairs of hands, so the
  Appointment tab's Bootfitter field is a team: the lead — whose column the booking sits in,
  and who can still be swapped — plus anyone assisting, added and removed as chips. Everyone
  attached is genuinely busy, so the block is drawn in each of their columns and counts
  against their availability and conflicts. Only the lead's copy drags; the others move with
  it. With more than one fitter on the booking, the staff assessment asks which of them
  recorded it, per person, and the saved badge carries the name.
- **The bar at the foot of a booking is its bill.** It carries the price of the booked
  service, anything charged on the equipment, the subtotal and what has been paid. Take
  payment opens a popover offering the four routes the shop uses — Shopify, a Shopify link,
  Square or Stripe — records the whole outstanding balance against one of them, and stamps
  the time and who took it. Reopening shows what was recorded, and it can be removed if it
  went against the wrong booking.
- **Closing out has three endings.** Send to POS keeps the button in the complete dialog; the
  chevron beside it offers the other two. A payment link is sent and the booking is marked
  awaiting payment — the balance stays owing, because a link is not money. An external
  payment records what arrived some other way — bank transfer, cash, another terminal — and
  clears the balance like any other.
- **Equipment is identified before it is worked on.** The entry grid asks type, brand and
  model on one row, then how it measures on the next: size, and the one spec that matters for
  that type — flex on a boot, profile on a ski or board, neither on a helmet. Brands and
  sizes are per type, so changing the type clears the specs entered against the old one. The
  services applied to the item, and their location, side, note and Included/+price pill, are
  unchanged.
- **Answers are per person, not per booking.** A multi-customer booking keeps its own
  required-at-booking answers, fitting questionnaire, staff assessment, check-in and
  equipment record for each person on it.
- **Both sides of the Fitting tab are the same form.** Customer questions and the staff
  assessment share a card, a labelled field grid and a completion action, and either can be
  filled at any point. Check-in timestamps the arrival but no longer gates the assessment.
- **A filtered week divides by fitter.** Week view shows a column per day; filter to
  particular fitters and each day divides into a column for each of them, so a person's week
  can be read down the page. Unfiltered it stays one column per day — twenty-eight columns
  of an empty shop helps nobody. A fitter keeps one width across every day, so the days stay
  aligned.
- **The date is the middle of the three nav buttons**, with an arrow either side. Clicking it
  opens a month calendar with Today and Tomorrow beneath it. Any date can be opened, forwards
  or back; the arrows step a day, or a week in week view, rolling over the week boundary. A
  booking carries the week it belongs to, so other weeks open empty until something is booked
  into them — the seed only fills the current one.
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
