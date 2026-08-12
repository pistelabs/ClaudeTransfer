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
  api/           Django API boundary — see "Backend" below
    dto.ts       Wire shapes (snake_case, ISO dates, choice slugs)
    mappers.ts   DTO <-> UI type conversion
    live.ts      fetch client for the real backend
    mock/        In-memory stand-in serving the same shapes
  components/
    ui/          Design-system primitives
    directory/   Toolbar, table, Add-customer and Export dialogs
    detail/      Equipment, appointments, details, DIN card, signature dialogs
  pages/         DirectoryPage, CustomerDetailPage
  store/         CustomerProvider (data + mutations), ToastProvider
  lib/           din, csv, filters, format, download, config
  styles/        tokens.css, global.css
docs/
  api-contract.md  Endpoints and payloads the backend must serve
```

### Routes

| Route | View |
| --- | --- |
| `/customers` | Directory |
| `/customers/:customerId` | Customer detail |

`/` and unknown paths redirect to `/customers`.

### State

`CustomerProvider` fetches the customer list on mount, caches one DIN record
per customer, and exposes the async mutations the pages call — every one of
them goes through `src/api`. View-local state (search, filter, row selection,
expansion, dialog visibility, edit draft) lives in the component that owns it.

## Backend

The app talks to a Django REST API. That backend does not exist yet, so
`src/api/mock/` serves the same endpoints from memory and the UI runs against
it unchanged. Point at a real server by setting the base URL:

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000/api
```

`src/api/index.ts` picks the live client when that variable is set and the mock
when it is not. Everything above the boundary — pages, store, components — is
identical either way.

**`docs/api-contract.md` is the specification to build the Django side
against**: endpoints, JSON payloads, choice values, auth and error handling,
plus a model sketch. `src/api/dto.ts` is the same contract in TypeScript.

Two things the backend owns that the mock currently fakes:

- **Signature storage.** The pad produces a PNG data URL; the client uploads it
  as `multipart/form-data` and the server stores the file, stamps `signed_at`
  and records who signed it. The mock keeps the data URL in memory.
- **Clearing a signature when the override changes.** The frontend clears it
  optimistically, but the server must enforce it — a signature authorises one
  specific DIN value.

Still stubbed: the equipment panel's **Open** button raises a toast instead of
opening the job record. `GET /jobs/{id}/` is reserved for it in the contract.

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
- **`rating` was dropped**, as the handoff instructs — it is not displayed.
- **`equipment[].notes` is displayed** in the expanded equipment panel, above
  the job list, with a "No notes recorded." empty state, and each job row names
  its technician. The hifi handoff dropped both, but the original flow diagram
  requires the equipment detail to show its notes and the services completed.
- **`memberSince` is a field on the customer**, not derived from a lookup list.
- **The sidebar edit form follows the read view's field order** (Name, Phone,
  Email, Preferred, Branch), so fields don't move when you switch into edit
  mode. The handoff put Branch second.
- **The "Open" job action toasts** `Opening service {jobId} — {service}` as a
  stub for navigating to the job record.
- **Accessibility additions** not in the prototype: labelled controls, dialogs
  with `role="dialog"`/`aria-modal` and Escape handling, keyboard-operable
  table rows, `aria-pressed`/`aria-expanded` on toggles, and a
  `prefers-reduced-motion` guard on the animations.
- **Responsive fallbacks** were added below 900px (single column) and 820px
  (email/phone columns drop out of the table); the design specified desktop
  only.

## Retiring the mock

`src/api/mock/fixtures.ts` is the only module with customer data in it, and it
is already in the backend's wire shape. Once the Django API is live: set
`VITE_API_BASE_URL`, delete `src/api/mock/`, drop the `usingLiveApi` branch in
`src/api/index.ts`, and repoint the three tests that read the fixtures.
