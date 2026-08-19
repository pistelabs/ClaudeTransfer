# ClaudeTransfer

Bringing designs to Ai for the guys, hopefully reducing their workload.

This repo currently holds the **Workshop Admin — Services** section, built from the
`Admin_Services_Section` design handoff. Every interactive element comes from
[ui.shadcn.com](https://ui.shadcn.com) components.

## Running it

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your Django API
npm run dev                  # http://localhost:3000 → redirects to /admin/services
npm run build                # production build
npm run lint                 # eslint
```

With `NEXT_PUBLIC_API_BASE_URL` unset the console falls back to in-memory data and shows a banner
saying so, so the UI can be reviewed before the backend is up.

## Data

Equipment types, service groups and services live in Django and are read and written over its REST
API — nothing is stored in the browser. **[docs/django-api.md](docs/django-api.md)** is the
contract: endpoints, the exact payloads, and a reference DRF implementation (models, serializers,
viewsets, router) that this UI was tested against end to end.

| Layer | File |
| --- | --- |
| Fetch wrapper (base URL, session cookie, CSRF, error parsing) | `lib/api/http.ts` |
| Wire format ↔ UI types | `lib/api/dto.ts`, `lib/api/serializers.ts` |
| Endpoint calls | `lib/api/django-workshop-api.ts` |
| In-memory stand-in when no API is configured | `lib/api/mock-workshop-api.ts` |
| Load + mutate state for the pages | `lib/workshop/store.tsx` |

Appointment groups and appointments follow the same pattern and are specified in the doc; their UI
is not built yet.

## What is built

`/admin/services` — the Services section in full:

- **Service groups** — pill selector (`Tabs`) with live counts, plus add / rename / delete.
- **Services list** — colour dot, name, `Quoted` / `Hidden` badges, duration + description meta,
  price, a visibility `Switch`, and edit / duplicate / delete actions. Empty states for both
  "no services in this group" and "no groups at all".
- **Add / edit service dialog** (660px, sticky header + footer, scrolling body) with:
  1. **Basics** — name, description, colour swatch picker (Kanban / calendar colour).
  2. **Pricing & duration** — Fixed price vs Quoted per job, price (labelled *Minimum price* when
     quoted), duration + unit.
  3. **Options** — allow multiples per equipment item.
  4. **Equipment types** — selectable tiles, limited to the types enabled in Equipment Types.
  5. **Required information** — the *DIN* and *Snowboard Stance* standardized-entry tiles plus a
     repeatable field list (Free entry / Predefined options / File upload, with a single-select vs
     multi-select option builder).
  6. **Waivers** — independent check-in and release waivers, each revealing its terms textarea and
     customer/staff signature checkboxes.
  7. **Dockets** — dockets-per-job stepper and a barcode switch.

  Save is disabled until the name is filled; Escape and backdrop close without saving; the dialog
  edits a draft copy, so Cancel discards.

Loading, empty and error states are covered: a skeleton while the API responds, an alert with a
retry button when it fails, inline errors on save, and disabled controls while a request is in
flight.

The other four sections (General, Equipment Types, Appointments, Notifications) exist as routes with
placeholder pages so the section nav works — they are not part of this slice.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui components in `components/ui/`, vendored from the official
  `shadcn-ui/ui` registry (`new-york-v4`), stock **zinc** base colour with `--radius: 0.5rem`
- `lucide-react` icons, Geist font via `next/font`, `sonner` for toasts

`components.json` is configured for the zinc base colour, so `npx shadcn@latest add <component>`
drops new components straight into `components/ui/`.

## Layout

```
app/admin/services/page.tsx      the Services route
app/admin/layout.tsx             app bar + section nav + providers
components/services/             services UI (section, rows, dialogs, field editor, tiles)
components/ui/                   shadcn/ui components
lib/api/                         Django REST client, DTO mapping, mock fallback
lib/workshop/                    domain types, constants and the store
docs/django-api.md               API contract + reference DRF implementation
```
