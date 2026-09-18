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
- **Plain CSS for the surfaces**, with design tokens as custom properties. The design
  specifies exact pixel values (11.5px type, 34px controls, 64px hour rows) that no utility
  scale carries, so the schedule, sheets and header stay hand-written. The components are
  Tailwind; both read the same tokens.
- **shadcn/ui on Radix**, one component per file in `components/ui`. Button, Badge, Card,
  Separator, Label, DropdownMenu, Popover, Tabs, ToggleGroup, ButtonGroup and the Sonner
  Toaster, written with `cva`, `cn()` and `data-slot` as shadcn writes them. The variant maps
  are tuned to this design rather than shadcn's defaults — 34px controls at 13px, and the
  studio's own `success`, `pay` and `action` beside shadcn's set — which is what owning the files
  is for.
- **Tailwind v4**, imported layer by layer in `styles/index.css`. Everything Tailwind ships
  sits in a cascade layer and the hand-written stylesheets stay unlayered, which beats layered
  CSS whatever the specificity, so Preflight normalises what the components expect without
  reaching into the pixel-specified CSS below.
- **lucide-react** for icons.

## Layout

```
src/
  index.ts              what a host imports: Scheduler, hydrate, the API
  Scheduler.tsx         the console as one mountable component
  host-example.tsx      a worked embedding, served at /host.html
  api/                  the backend seam — wire types, mappers, Django client
  lib/money.ts          cents in, formatted money out; DecimalField conversions
  lib/utils.ts          cn() — clsx plus tailwind-merge, shadcn's class helper
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
    ui/                 shadcn components, avatar, question field, hooks
  styles/               tokens plus one stylesheet per surface
```

## One set of tokens, three ways of asking for them

`styles/tokens.css` is the single source of colour, radius, shadow and geometry. It is named
three times so that nothing can drift:

1. the ramp itself — `--n-125`, `--primary`, `--hour-px` — which the 4,700 lines of
   hand-written CSS reference directly, as they always have;
2. shadcn's vocabulary aliased onto it, so `--border` *is* `--n-125` and `--background` *is*
   `--white`, which is what the components read;
3. an `@theme inline` block mapping those into the namespace Tailwind generates utilities
   from, so `bg-background` resolves to the same value `var(--background)` does.

Change a value once and the schedule grid and a shadcn Button move together.

Two consequences worth knowing. Class names that collide with a Tailwind utility get both
rules, so the schedule canvas is `.sched-grid` rather than `.grid` and the text field is
`.input-text` rather than `.text-input` — `input` being a colour token makes `text-input` a
real utility. And the app's own classes keep `--`/`__` modifiers, while anything a Radix
component drives is styled off `data-state` instead.

## Connecting a backend

Everything below `src/api` is the seam, and nothing outside it knows the backend
exists.

```
src/api/types.ts   the wire format — snake_case, primary keys, ISO instants,
                   DecimalFields as strings, DRF's pagination envelope
src/api/map.ts     wire ↔ domain, the only place the two vocabularies meet
src/api/client.ts  fetch for Django: session cookie, CSRF header, DRF errors
src/api/index.ts   one function per endpoint, plus loadSchedule for a date window
```

Three conversions live in the mapper and nowhere else:

| on the wire | in the app |
|---|---|
| `staff_id: "47"` | `staffId: "47"` — the grid works out which column at render time |
| `starts_at: "2026-09-15T09:30:00+02:00"` | `startsAt`, with day/week/minute derived from it |
| `price: "120.00"` | `12000` — whole cents, formatted only where drawn |

### Mounting it in another project

The console is a component, not an application. `main.tsx` is only the
standalone dev shell; a host imports from `src/index.ts`:

```tsx
const data = await loadSchedule({ from: '2026-09-14', to: '2026-09-20' });

configureCatalogue({ staff: data.staff });   // before the first render
hydrateScheduler(data);                      // bookings, walk-ins, customers
root.render(<Scheduler />);
```

The catalogue goes first because the screens read staff and services as module
constants — that is the one ordering constraint. `host.html` is a working example
of the whole sequence against fixtures shaped exactly as Django sends them; open
it with `npm run dev` and swap `fixtures()` for `loadSchedule()`.

### Worth knowing before you wire it up

- **Times render in the viewer's timezone.** The wire carries an offset and it is
  honoured, so a booking sent as `09:30+02:00` reads as 09:30 on a machine in
  that zone and 07:30 on one in UTC. Right for staff standing in the shop; if the
  console is ever used from another country and should still show shop time, that
  needs a fixed timezone rather than the browser's.
- **Ids are opaque strings.** Send whatever the primary key is; nothing parses them.
- **Mutations are still local.** `createAppointment` and friends exist and are
  typed, but the store writes to itself synchronously — there is no loading,
  error or rollback state yet. That is the next piece of work, and the reason the
  store is worth splitting from the server cache before it grows further.

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
- **The customer leads the Appointment tab**, then the scheduling facts, then the report and
  any note. Who the booking is for is the thing being looked up; when it is happens to be
  visible on the grid already. Every customer reads the same — avatar, name, email, phone —
  whether the booking is for one person or three. How it was taken and when share one line in
  the sheet's header: the route first, then the timestamp.
- **The bar at the foot of a booking is its bill**: balance due, the subtotal, what has been
  paid, and one green Complete button. Reschedule and delete are not there: they act on the
  whole booking rather than on taking money, so they sit under the menu in the sheet's top
  right, beside Close. The subtotal
  includes the booked service's price as well as anything charged on the equipment; hovering
  it shows the split. The Paid figure is also the way in to recording a payment — it opens a
  popover offering the four routes the shop uses (Shopify, a Shopify link, Square, Stripe),
  takes the whole outstanding balance against one, and stamps the time and who took it. It
  turns green when paid and amber while a link is outstanding.
- **Escape takes the topmost layer only.** A menu or popover opened over a sheet or a dialog
  closes on the first press; whatever it was covering closes on the next. Radix dismisses its
  own layer and flushes that synchronously, which would otherwise re-arm the sheet's handler
  while the same keypress is still travelling, so the event carries whether a layer already
  spent it.
- **Confirming a booking asks where the money goes.** A new appointment that costs anything
  opens a prompt with the total due and the two endings the desk has: send it to the POS, or
  pay later. The customer is standing there at that moment, which is the difference between
  taking the money and chasing it. The booking is saved before the prompt appears, so nothing
  can lose it — Escape and the backdrop mean pay later. The booking sheet stays open behind
  the prompt until it is answered, so the question plainly belongs to the booking that was
  just made rather than arriving out of nowhere over the schedule; the sheet stops checking
  for clashes at that point, or it would warn that the new booking overlaps itself. Sending it to the till records a
  pending charge, not a payment: the balance keeps showing until the money lands. Walk-ins are
  not asked (no time, no price yet) and neither is a reschedule.
- **Closing out has three endings.** Send to POS keeps the button in the complete dialog; the
  chevron beside it opens the other two, and choosing to record an external payment swaps that
  same popover for the form rather than opening a second layer over it. A payment link is sent and the booking is marked
  awaiting payment — the balance stays owing, because a link is not money. An external
  payment records what arrived some other way — bank transfer, cash, another terminal — and
  clears the balance like any other.
- **Equipment is identified before it is worked on.** The entry grid asks type, brand and
  model on one row, then how it measures on the next: size, and the one spec that matters for
  that type — flex on a boot, profile on a ski or board, neither on a helmet. Brands and
  sizes are per type, so changing the type clears the specs entered against the old one. The
  services applied to the item, and their location, side, note and Included/+price pill, are
  unchanged.
- **The customer's PDF report is one button on the Appointment tab**, disabled until both
  question sets are complete for everybody on the booking — a report missing half a person's
  fitting is worse than none, so the button says what is missing instead of producing one.
  Creating it is explicit rather than a side effect of closing the appointment out, so a
  fitter can make it, look at it, and still take the money afterwards. What it records is a
  snapshot: who made it, when, and per person what was captured. A snapshot rather than a
  live view, because the sheet stays editable and a report that quietly rewrote itself would
  not be worth handing anybody.
- **Answers are per person, not per booking.** A multi-customer booking keeps its own
  required-at-booking answers, fitting questionnaire, staff assessment, check-in and
  equipment record for each person on it.
- **The Fitting tab shows both sets at once.** Customer questions on top, the staff assessment
  below — they used to share one panel behind a Customer/Staff switch, which meant a fitter
  could not see the answers they were assessing against without leaving the assessment. Same
  card, same labelled field grid, same completion action for each, and each saves on its own.
  Either can be filled at any point.
- **A filtered week divides by fitter.** Week view shows a column per day; filter to
  particular fitters and each day divides into a column for each of them, so a person's week
  can be read down the page. Unfiltered it stays one column per day — twenty-eight columns
  of an empty shop helps nobody. A fitter keeps one width across every day, so the days stay
  aligned.
- **The date is the middle of the three nav buttons**, with an arrow either side, and a Today
  button after them. Today greys out rather than disappearing once today is on screen, so the
  header keeps its shape whatever day is showing; in week view this week counts as today.
  Clicking the date opens a month calendar with Today and Tomorrow beneath it. Any date can be opened, forwards
  or back; the arrows step a day, or a week in week view, rolling over the week boundary. A
  booking carries the week it belongs to, so other weeks open empty until something is booked
  into them — the seed only fills the current one. A booking sheet opened from a date in
  another month opens its calendar on that month, so the chosen date is on screen rather than
  a month back.
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
