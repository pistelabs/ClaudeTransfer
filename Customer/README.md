# Customer

Customer management interface for a two-branch ski shop: a searchable customer
directory, and a per-customer record holding equipment service history,
appointments, editable contact details, and a DIN (ski binding release value)
calculator with a signed manual-override flow.

Built from the `Customer Page` design handoff.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck, then production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc` only |
| `npm test` | Vitest run (unit tests for the DIN, CSV, filter and format logic) |

## Stack

React 19 + TypeScript, Vite, React Router, CSS Modules, `lucide-react` icons.

There was no existing app to build into, so this is a fresh Vite project. The
design was specified against shadcn/ui's visual language; rather than pull in
shadcn's generator, its tokens live in `src/styles/tokens.css` and a small set
of primitives in `src/components/ui/` (Button, Field/Input/Select, Checkbox,
Badge, Card, Dialog, Toast, Avatar) implement the same visual vocabulary. Every
colour, radius and shadow in the app resolves to a token — no component
hard-codes a hex value.

## Layout

```
src/
  components/
    ui/          Design-system primitives
    directory/   Toolbar, table, Add-customer and Export dialogs
    detail/      Equipment, appointments, details, DIN card, signature dialogs
  pages/         DirectoryPage, CustomerDetailPage
  store/         CustomerProvider (data + mutations), ToastProvider
  lib/           din, csv, filters, format, download, config
  data/seed.ts   Seed customers and DIN measurements
  styles/        tokens.css, global.css
```

### Routes

| Route | View |
| --- | --- |
| `/customers` | Directory |
| `/customers/:customerId` | Customer detail |

`/` and unknown paths redirect to `/customers`.

### State

`CustomerProvider` holds the customer list and one DIN record per customer
(measurements, override, signature, signed timestamp) and exposes the mutations
the pages call. It is the single place to swap in a real API — nothing else
knows where customers come from. View-local state (search, filter, row
selection, expansion, dialog visibility, edit draft) lives in the component
that owns it.

## Domain rules worth knowing

**DIN** (`src/lib/din.ts`) is calculated from weight, height, age, boot sole
length and skier ability, clamped to 3.0–8.0 and rounded to the nearest 0.5.
Ticking "Set a custom DIN" seeds the override with the calculated value and
hides the calculator inputs. Any edit to the override clears an existing
signature, forcing a re-sign — an override is only valid with a signature
attached to that exact value.

**Job IDs** are `{company}-{branch}-{sequence}`, e.g. `AP-CB-0042`. `AP` is the
placeholder company from the design and lives in `src/lib/config.ts`; change it
there.

**Signatures** are captured on a `<canvas>` and stored as PNG data URLs. In
production these should be uploaded and served back by URL — the store keeps
`signatureUrl` as an opaque string so that swap is a data-layer change only.

## Notes on the handoff

Faithful to the spec, with these deliberate decisions:

- **DIN records are per customer and survive navigation.** The prototype reset
  the DIN state whenever a customer was opened; the handoff calls for a stored
  per-customer DIN record, so that is what the store models.
- **`equipment[].notes` and `rating` were dropped**, as the handoff instructs —
  neither is displayed.
- **`memberSince` is a field on the customer**, not derived from a lookup list.
- **The "Open" job action toasts** `Opening service {jobId} — {service}` as a
  stub for navigating to the job record.
- **Accessibility additions** not in the prototype: labelled controls, dialogs
  with `role="dialog"`/`aria-modal` and Escape handling, keyboard-operable
  table rows, `aria-pressed`/`aria-expanded` on toggles, and a
  `prefers-reduced-motion` guard on the animations.
- **Responsive fallbacks** were added below 900px (single column) and 820px
  (email/phone columns drop out of the table); the design specified desktop
  only.

## Replacing the seed data

`src/data/seed.ts` is the only module with customer data in it. Point
`CustomerProvider` at a real API and the rest of the app is unchanged.
