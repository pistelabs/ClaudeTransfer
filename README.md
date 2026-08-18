# ClaudeTransfer

Bringing designs to Ai for the guys, hopefully reducing their workload.

This repo currently holds the **Workshop Admin — Services** section, built from the
`Admin_Services_Section` design handoff. Every interactive element comes from
[ui.shadcn.com](https://ui.shadcn.com) components.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /admin/services
npm run build   # production build
npm run lint    # eslint
```

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
lib/workshop/                    types, seed data and the in-memory store
```

State lives in `lib/workshop/store.tsx` (React context, in memory) — swap it for the real data layer
when wiring this into the product.
