# Phase 2 — Cloudinary-backed Image Management

**Date:** 2026-04-20
**Builds on:** Phase 1 (admin auth, branch `feat/admin-auth`)
**Status:** Draft, pending user approval

## Goal

Move all site images (gallery, event posters, founder photos, home hero) from
hardcoded `/public/*` paths into Cloudinary, and give the admin a UI to upload,
delete, replace, and reorder them — without touching code or waiting for a
redeploy.

This is the feature the client has been asking for: "I want to change photos
without bothering you."

## Non-goals (deliberate, deferred to later phases)

- Adding new gallery categories or new event slots from the UI (slot list is
  fixed in code)
- Editing event titles / dates / text → **Phase 2.5**
- Editing phone numbers, page copy, founder bios → **Phase 3**
- Bulk operations (multi-select delete, bulk upload) — single-photo flow only
- Image cropping / editing in admin — Cloudinary's web UI exists if needed
- Captions / alt text editing in admin — auto-generated from slot label for now
- Public-facing image search / filtering

## Architecture

Cloudinary is the source of truth for image bytes **and** image metadata
(order, slot membership). No database. No JSON manifest of image state in the
repo. Server endpoints proxy Cloudinary's API; the React app never talks to
Cloudinary directly except during the upload itself.

```
Browser (admin)              Vercel API                        Cloudinary
   │                              │                                  │
   │  POST /api/upload-signature ▶│  signs params w/ API_SECRET      │
   │◀── {signature, timestamp,    │                                  │
   │     api_key, public_id} ─────┤                                  │
   │                                                                 │
   │ ────── PUT file directly to Cloudinary with signed params ─────▶│
   │◀──────── {public_id, secure_url, width, height, ...} ───────────┤
   │                                                                 │
   │  GET /api/images?            │  Cloudinary Search API           │
   │       category=gallery&      │  filter by folder, sort by       │
   │       slot=classroom ───────▶│  context.custom.sort             │
   │◀── [{public_id, url,         │                                  │
   │     sort, width, height}]────┤                                  │
   │                                                                 │
   │  POST /api/images/reorder ──▶│  PUT context.custom.sort         │
   │  POST /api/images/delete ───▶│  destroy public_id               │
   │  POST /api/images/replace ──▶│  destroy + upload new (singles)  │
```

### Why no database for image order

Cloudinary supports per-asset metadata via `context`. We store
`context.custom.sort` (a number) on each image. The Search API can sort by it.
Updating order = `PUT` request to Cloudinary. Updates are instant; no
redeploy, no cache invalidation in our code.

## Slot registry

The list of slots lives in code as the single source of truth. Admin can
manage *what's in* each slot, not which slots exist (avoids client accidentally
creating a "test" gallery section that ships to production).

**File:** `src/content/image-slots.ts`

```ts
export type SlotType = 'collection' | 'single';

export type SlotDef = {
  id: string;
  label: string;
  type: SlotType;
};

export type Category = 'gallery' | 'events' | 'founders' | 'home';

export const SLOTS: Record<Category, SlotDef[]> = {
  gallery: [
    { id: 'classroom',      label: 'Classroom',          type: 'collection' },
    { id: 'practical-life', label: 'Practical Life',     type: 'collection' },
    { id: 'language',       label: 'Language',           type: 'collection' },
    { id: 'mathematics',    label: 'Mathematics',        type: 'collection' },
    { id: 'geography',      label: 'Geography',          type: 'collection' },
    { id: 'art-craft',      label: 'Art & Craft',        type: 'collection' },
    { id: 'story-time',     label: 'Story Time',         type: 'collection' },
    { id: 'gardening',      label: 'Gardening',          type: 'collection' },
  ],
  events: [
    { id: 'summer-camp',  label: 'Summer Camp 2026',     type: 'single' },
    { id: 'admissions',   label: 'Admissions 2026-27',   type: 'single' },
    { id: 'day-care',     label: 'Day Care Programme',   type: 'single' },
    { id: 'after-school', label: 'After School Program', type: 'single' },
  ],
  founders: [
    { id: 'sushma',  label: 'Smt. Sushma',  type: 'single' },
    { id: 'shwetha', label: 'Smt. Shwetha', type: 'single' },
  ],
  home: [
    { id: 'hero', label: 'Home Hero', type: 'single' },
  ],
};
```

**Adding a new slot later** is a code change (~5 lines + use the new
`<CloudinaryImage>` on the public page). Phase 2.5 does not change this.

## Cloudinary folder convention

Mirrors the slot registry exactly. All under a single `sanskaar/` root so the
school's Cloudinary account stays organized.

```
sanskaar/
  gallery/
    classroom/<random-public-id>.jpg     ← collection: many files per folder
    practical-life/<random-public-id>.jpg
    ... (one folder per gallery slot, ~3 photos each initially)
  events/
    summer-camp                          ← single: fixed public_id, no extension
    admissions
    day-care
    after-school
  founders/
    sushma
    shwetha
  home/
    hero
```

For **collection slots**, each upload gets a Cloudinary-generated random ID
inside the folder. Order is via `context.custom.sort`.

For **single slots**, the `public_id` is the slot id (`sanskaar/events/summer-camp`).
Re-uploading with the same `public_id` plus `overwrite=true` replaces the file.
The URL stays stable across replacements (simpler for caching, social previews).

## Required env vars

Already in `.env.local` from earlier conversation. Need to mirror to Vercel.

| Name                      | Source                       | Used by                |
|---------------------------|------------------------------|------------------------|
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary dashboard         | Server + client (URLs) |
| `CLOUDINARY_API_KEY`      | Cloudinary dashboard         | Server (signing)       |
| `CLOUDINARY_API_SECRET`   | Cloudinary dashboard         | **Server only**        |

The cloud name needs to be readable from the browser too (for image URLs), so
we'll also expose it as `REACT_APP_CLOUDINARY_CLOUD_NAME` (CRA convention for
public env vars). The API key and secret stay server-side.

## API endpoints

All admin endpoints reuse `getSession()` from Phase 1. Anonymous = 401.

### `GET /api/images?category=<cat>&slot=<id>` — public

Returns the list of images in a slot, ordered.

Response:
```json
{
  "images": [
    {
      "public_id": "sanskaar/gallery/classroom/abc123",
      "secure_url": "https://res.cloudinary.com/.../upload/.../abc123.jpg",
      "width": 1920,
      "height": 1280,
      "sort": 1
    },
    ...
  ]
}
```

For single slots, returns an array of length 0 or 1. Same shape.

### `POST /api/upload-signature` — admin-only

Body: `{ category: "gallery", slot: "classroom", isReplace?: boolean }`

Returns Cloudinary's required signed-upload params, scoped to the right
folder/public_id:
```json
{
  "signature": "abcdef...",
  "timestamp": 1745234567,
  "api_key": "<from env>",
  "cloud_name": "<from env>",
  "folder": "sanskaar/gallery/classroom",
  "public_id": null,                     // collection: Cloudinary picks
  "overwrite": false,
  "context": "custom[sort]=99"            // append at end by default
}
```

For single slots, `public_id` is fixed (e.g., `sanskaar/events/summer-camp`)
and `overwrite` is `true`.

The browser then PUTs the file directly to
`https://api.cloudinary.com/v1_1/<cloud>/auto/upload` with these params + the
file. Our server doesn't proxy the file bytes (saves bandwidth + Vercel
function timeout limits).

### `POST /api/images/reorder` — admin-only

Body: `{ orderings: [{ public_id, sort: 1 }, { public_id, sort: 2 }, ...] }`

Server iterates and PUTs `context.custom.sort` on each via Cloudinary's
`/resources/image/upload/<id>/context` endpoint. Returns 200 once all done.

### `POST /api/images/delete` — admin-only

Body: `{ public_id: "..." }`

Server calls Cloudinary's `destroy` API. Returns 200.

For single slots, calling delete leaves the slot empty (next page load shows
a placeholder). Admin can then upload a replacement.

## Server-side library

`src/lib/cloudinary.ts` — thin wrapper around `cloudinary` npm SDK:

- `signUploadParams(folder, publicId?, overwrite, context)` → returns signed payload for client upload
- `listImages(folder)` → returns array sorted by `context.custom.sort`
- `setImageSort(publicId, sort)` → updates context
- `deleteImage(publicId)` → destroys

Uses `CLOUDINARY_API_SECRET` from env. Throws if missing (same defensive
pattern as `session.ts` from Phase 1).

## Public site changes

### `<CloudinaryImage>` helper

`src/components/CloudinaryImage.tsx`:
```tsx
type Props = {
  publicId: string;
  alt: string;
  width?: number;        // for srcset generation
  className?: string;
  loading?: 'lazy' | 'eager';
};
```

Builds a Cloudinary URL with on-the-fly transformations:
`https://res.cloudinary.com/<cloud>/image/upload/c_fill,w_<width>,q_auto,f_auto/<public_id>`

Generates a `srcset` for 400/800/1200/1600 widths so browsers pick the right
size. `f_auto` serves AVIF/WebP/JPG based on browser support. `q_auto` picks
quality. **This is what fixes the existing HEIC-doesn't-render problem.**

### `useSlotImages` hook

`src/hooks/useSlotImages.ts`:
```ts
useSlotImages('gallery', 'classroom')
  → { images: [...], loading: boolean, error: string | null }
```

Fetches `/api/images?category=...&slot=...`, caches in component state. No
external state library; React's built-in is enough for our scale.

### Page edits

| File | Change |
|---|---|
| `src/pages/Gallery.tsx` | Replace hardcoded array with `useSlotImages` per category |
| `src/pages/Events.tsx` | Replace `<img src="/gallery/...">` with `<CloudinaryImage publicId="sanskaar/events/summer-camp" />` |
| `src/pages/Founders.tsx` | Same swap for Sushma + Shwetha |
| `src/pages/Home.tsx` | Hero background + 3 featured images become `<CloudinaryImage>` calls |

## Admin UI

| Route | Renders |
|---|---|
| `/admin` | Existing dashboard; add a card "📷 Manage Images" linking to `/admin/images` |
| `/admin/images` | 4 category cards (Gallery, Events, Founders, Home) with slot count |
| `/admin/images/:category` | List of slots in that category. Click → manage |
| `/admin/images/:category/:slot` | The actual upload + grid + reorder UI |

### Collection slot UI (e.g., `/admin/images/gallery/classroom`)

```
┌────────────────────────────────────────────┐
│ Classroom (3 photos)              [⬆ Upload]│
├────────────────────────────────────────────┤
│ ┌─────┐  ┌─────┐  ┌─────┐                  │
│ │ #1  │  │ #2  │  │ #3  │   ← drag to       │
│ │     │  │     │  │     │     reorder       │
│ │  X  │  │  X  │  │  X  │   X = delete      │
│ └─────┘  └─────┘  └─────┘                   │
└────────────────────────────────────────────┘
```

Drag-and-drop: native HTML5 DnD. No new library — react-beautiful-dnd is
deprecated and the others are heavy. Keep it lean.

### Single slot UI (e.g., `/admin/images/events/summer-camp`)

```
┌────────────────────────────────────────────┐
│ Summer Camp 2026                           │
├────────────────────────────────────────────┤
│           ┌──────────────────┐             │
│           │                  │             │
│           │   current image  │             │
│           │                  │             │
│           └──────────────────┘             │
│                                            │
│              [⬆ Replace image]              │
└────────────────────────────────────────────┘
```

No delete (single slot is always present semantically; admin can only replace).

### Upload UX

Either a button-triggered file picker or drag-onto-the-card. After file pick:
1. Show progress bar
2. POST `/api/upload-signature` → get signed params
3. PUT file to Cloudinary with progress events on XHR
4. On success: refresh slot listing
5. On failure: show error, no state change

Single file at a time. Multi-upload deferred.

## Migration script

`scripts/migrate-images-to-cloudinary.ts` — Node script run once locally.

Mapping:
```
/public/gallery/classroom-{01,02,03}.jpg       → sanskaar/gallery/classroom/<random>
/public/gallery/practical-life-{01,02}.jpg     → sanskaar/gallery/practical-life/<random>
/public/gallery/language-{kannada,english}-02  → sanskaar/gallery/language/<random>
/public/gallery/mathematics-{01,02,03}.jpg     → sanskaar/gallery/mathematics/<random>
/public/gallery/geography-{01,02}.jpg          → sanskaar/gallery/geography/<random>
/public/gallery/art-craft-{01,02}.jpg          → sanskaar/gallery/art-craft/<random>
/public/gallery/story-time-{01,02,03}.jpg      → sanskaar/gallery/story-time/<random>
/public/gallery/gardening-{01,02,03}.jpg       → sanskaar/gallery/gardening/<random>

/public/summer_camp.jpg                        → sanskaar/events/summer-camp (single)
/public/gallery/admissions-01.jpg              → sanskaar/events/admissions (single)
/public/gallery/day-care-programme.jpg         → sanskaar/events/day-care (single)
/public/gallery/after-school-programme.jpg     → sanskaar/events/after-school (single)

/public/sushma.jpg                             → sanskaar/founders/sushma (single)
/public/shwetha.jpg                            → sanskaar/founders/shwetha (single)

/public/gallery/mathematics-03.jpg             → sanskaar/home/hero (single, copy of gallery image)
```

Sets `context.custom.sort` to 1, 2, 3, ... within each collection (preserves
the current display order).

Idempotent — re-running with the same public_ids skips files already uploaded.

After migration completes successfully:
- A separate cleanup commit deletes `/public/gallery/`,
  `/public/summer_camp.jpg`, `/public/{sushma,shwetha}.jpg`,
  `/public/banner.jpg`, `/public/poster.jpg` (the last two unused)
- `/public/logo*.{jpg,png}` stays (favicon / PWA assets)
- `/public/images/*.heic` (gitignored source originals) stays as the dev's
  local backup

## Local dev workflow

Same as Phase 1: `set -a && source .env.local && set +a && npx vercel dev`.

Three new env vars must be in `.env.local` (already added during this
brainstorming).

The migration script is run from local terminal, not via vercel dev:
```bash
set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
```

## Deployment notes

Update `docs/admin-deploy.md`:

- Add the three Cloudinary env vars + `REACT_APP_CLOUDINARY_CLOUD_NAME` to
  the required-vars table (with note on Preview vs Production scope, same as
  existing vars)
- Document migration: "before deploying this branch, run the migration
  script locally so production has images to display"
- Note that the cleanup commit (deleting `/public/gallery/`, etc.) MUST land
  in the same PR as the Cloudinary code, otherwise either the site shows
  duplicates briefly or breaks links during rollout

## Test plan (manual)

After implementation, with `vercel dev` running locally and migration done:

**Public site:**
1. `/gallery` → all 8 sections render with photos from Cloudinary, no broken images
2. `/events` → all 4 event posters render
3. `/founders` → both founders render
4. `/` (home) → hero + 3 featured images render
5. Open DevTools Network tab → confirm image requests go to `res.cloudinary.com`, not `/gallery/...`
6. View mobile breakpoint → confirm Cloudinary serves smaller variants (check `srcset`)

**Admin flow:**
7. Log in as admin → see "Manage Images" card
8. Click → 4 categories visible
9. Gallery → Classroom → grid of 3 photos
10. Upload a new photo → appears in grid
11. Drag photo #4 to position #1 → order persists on refresh
12. Delete photo #4 → grid shrinks back to 3
13. Events → Summer Camp → "Replace image" → upload new poster → replaces
14. Visit `/events` in another tab → new poster shows after hard refresh
15. Log out → `/admin/images` redirects to login

**Edge cases:**
16. Upload non-image file (.pdf) → friendly error, no crash
17. Upload >10 MB → friendly error
18. Network offline mid-upload → friendly error, partial upload not committed
19. Delete the last photo in a collection slot → slot shows empty state
20. Delete a single-slot photo → public page shows placeholder until replaced

## Out of scope (verify NOT in this PR)

- New gallery categories from the UI
- Editing event titles, dates, or descriptions
- Editing phone numbers or page copy
- New event slots from the UI
- Batch upload / batch delete
- Image cropping in admin
- Caption / alt text editing in admin (alt text auto-generated from slot label)
- Audit log of who changed what
- Roles / permissions (any admin can do anything)
