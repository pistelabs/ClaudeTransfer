# Store Management

The five-page store back-office from the design handoff
(`Store Management Dashboard Design`), built with React + TypeScript + Tailwind
and shadcn/ui, ready to point at a Django backend.

```bash
npm install
npm run dev     # http://localhost:5173 — runs on demo data out of the box
npm run build   # tsc -b && vite build
```

## Pages

| Page | What the manager does there |
| --- | --- |
| **Schedules** | Weekly availability per staff member — time blocks, breaks, booking intervals, bookable services with lead times. Two views: by staff member, and by day across all staff |
| **Staff** | Add and edit staff, permissions, notification preference; record annual leave |
| **Booking** | Online booking page (URL + QR + lead times) and walk-in queue check-in |
| **Integrations** | Connect Lightspeed / Shopify / Square / Stripe, or declare no payment software |
| **Printing** | Thermal printer connection and docket layout, with a live preview that follows the roll size |

## Layout

```
src/
  App.tsx                    # nav + page routing + Sonner
  components/
    StoreNav.tsx             # underline nav (not shadcn Tabs — that's the Schedules switcher)
    common/                  # StaffAvatar, PageHeader, FieldLabel, CategoryChip, QrCode, CopyField, SettingCard
    schedules/               # SchedulesPage, WeekGridByStaff, DayGridByStaff, TimeBlockCard,
                             # TimeBlockDialog, RecurringOffDialog, AddBlockButton
    staff/                   # StaffPage, StaffCard, StaffDetailsDialog, StaffFormDialog,
                             # AnnualLeaveTable, AddLeaveDialog
    booking/                 # BookingPage, WalkInServicesDialog
    integrations/            # IntegrationsPage
    printing/                # PrintingPage, PrinterConnectionCard, DocketConfigCard, DocketPreview
    ui/                      # shadcn/ui components
  lib/
    types.ts                 # domain model
    categories.ts            # the four-category palette, avatar + leave colours
    time.ts                  # time maths, duration/week formatting
    validation.ts            # zod schemas (times, staff, leave, printer IP/port)
    demo-data.ts             # seed data behind the mock adapter
    api/                     # Django adapter, mock adapter, DTO mapping, query hooks
```

## Theme

Tokens come straight from the handoff — shadcn theme editor with **base Taupe,
primary Sky, charts Teal, radius 0.5rem** — and live in `src/index.css` as CSS
variables (`--primary`, `--track`, `--cat-rental-bg`, …). Fonts are Geist (body)
and Roboto (headings) from Google Fonts. **Light mode only**; dark mode is
explicitly out of scope for this design.

Controls are 36px tall, cards use 12px radius, inner panels 8px, and the four
service categories are colour-coded consistently across chips, dots and group
headers.

### About the shadcn components

`ui/` holds the standard shadcn/ui component sources (Radix + CVA +
`tailwind-merge`), vendored in directly because `ui.shadcn.com` is unreachable
from the build environment — the same files `npx shadcn@latest add` would copy
in. To pull more components on a machine with access:

```bash
npx shadcn@latest add <component>
```

## Backend

Runs on an in-memory mock adapter until you set:

```bash
# .env.local  (see .env.example)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

Endpoint contract, field shapes, a matching DRF sketch, and the CSRF/auth setup
are in [`docs/django-integration.md`](../docs/django-integration.md).

## Known placeholders

Integration lettermarks stand in for brand SVGs, and all seeded data is demo
content. QR codes are real and scannable (`qrcode.react`), encoding whatever
booking / check-in URL the settings hold. See the integration doc for the full
list.
