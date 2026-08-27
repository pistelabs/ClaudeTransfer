# ClaudeTransfer

Bringing designs to Ai for the guys, hopefully reducing their workload.

This repo currently holds the **Workshop Admin — Services, Appointments and Notifications**
sections, built from the `Admin_Services_Section` design handoff. Every interactive element comes from
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

Equipment types, service groups, services, appointment types, appointments and notification events
live in Django and are read and written over its REST API — nothing is stored in the browser. **[docs/django-api.md](docs/django-api.md)** is the
contract: endpoints, the exact payloads, and a reference DRF implementation (models, serializers,
viewsets, router) that this UI was tested against end to end.

| Layer | File |
| --- | --- |
| Fetch wrapper (base URL, session cookie, CSRF, error parsing) | `lib/api/http.ts` |
| Wire format ↔ UI types | `lib/api/dto.ts`, `lib/api/serializers.ts` |
| Endpoint calls | `lib/api/django-workshop-api.ts` |
| In-memory stand-in when no API is configured | `lib/api/mock-workshop-api.ts` |
| Load + mutate state for the pages | `lib/workshop/store.tsx` |

## What is built

`/admin/services` — the Services section in full:

- **Service groups** — pill selector (`Tabs`) with live counts, plus add / rename / delete.
- **Services list** — drag handle, colour dot, name, `Quoted` / `Hidden` badges, duration +
  description meta, price, a visibility `Switch`, and edit / duplicate / delete actions. Rows are
  reorderable by dragging the grip (or focusing it and pressing ↑ / ↓); the order is what customers
  and staff see elsewhere, and it is saved to Django. Empty states for both "no services in this
  group" and "no groups at all".
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
  7. **Dockets** — dockets-per-job stepper.

  Save is disabled until the name is filled; Escape and backdrop close without saving; the dialog
  edits a draft copy, so Cancel discards.

`/admin/appointments` — the same structure for appointments:

- **Appointment types** — pill selector with counts, plus add / rename / delete.
- **Appointments list** — same drag-to-reorder rows, with colour dot, name, `Check-in` / `Hidden`
  badges, duration + description, price (work mode), visibility `Switch`, and edit / duplicate /
  delete.
- **Add / edit appointment dialog** (680px) whose first control picks the mode:
  - **Carry out work** — basics and colour, duration, price, buffer time with Before / After / Both,
    the booking questions (Name / Email / Phone plus custom fields, each with a *Copy to Customer
    information* toggle), capacity steppers for customers and staff, and a tabbed area for
    **Customer information** / **Staff information** / **Equipment** — each questionnaire with its
    own fields, terms and signature switch, and the copied-from-booking fields listed automatically.
  - **Workshop check-in** — the reduced flow: basics, duration, the customer and equipment
    checkboxes (Name/Email/Phone, Brand/Model/Size/Colour, Notes), the equipment types the customer
    may drop off, and a switch that reveals the bookable services grouped by service group.

`/admin/notifications` — the message settings:

- **Company sending domain** — read-only, locked field showing the address everything is sent from.
- **Notification events** — a table of the nine events (`EVENT | SMS MESSAGE | EMAIL MESSAGE |
  ACTIVE`) with an active count, per-channel pills that switch SMS and email on or off, a pencil
  that opens the editor, and a `Switch` for the whole event. Disabled events dim their row.
- **Message editors** — Default / Custom toggle (the stock copy stays read-only on Default), merge
  tags inserted at the cursor, a send-timing row on the reminder events, and Send test, which
  reveals a recipient prefilled from General settings, validates it as a phone number or email, and
  is capped at 15 sends per rolling hour across both channels. The email editor adds a subject line
  and images with a header / above body / below body / footer position.

Loading, empty and error states are covered: a skeleton while the API responds, an alert with a
retry button when it fails, inline errors on save, and disabled controls while a request is in
flight.

The other two sections (General and Equipment Types) exist as routes with placeholder pages so the
section nav works — they are not part of this slice.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui components in `components/ui/`, vendored from the official
  `shadcn-ui/ui` registry (`new-york-v4`), **zinc** base colour with `--radius: 0.5rem` and the
  brand accent `#0284c7` as `--primary`
- `lucide-react` icons, Geist font via `next/font`, `sonner` for toasts

`components.json` is configured for the zinc base colour, so `npx shadcn@latest add <component>`
drops new components straight into `components/ui/`.

## Layout

```
app/admin/services/page.tsx      the Services route
app/admin/appointments/page.tsx  the Appointments route
app/admin/notifications/page.tsx the Notifications route
app/admin/layout.tsx             app bar + section nav + providers
components/services/             services UI (section, row, dialog)
components/appointments/         appointments UI (section, row, dialog)
components/notifications/        notifications UI (section, message editor)
components/workshop/             shared pieces (field editor, tiles, stepper, group dialogs)
components/ui/                   shadcn/ui components
lib/api/                         Django REST client, DTO mapping, mock fallback
lib/workshop/                    domain types, constants and the store
docs/django-api.md               API contract + reference DRF implementation
```
