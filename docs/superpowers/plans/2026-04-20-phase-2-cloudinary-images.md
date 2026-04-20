# Phase 2 — Cloudinary Image Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all site images (gallery, event posters, founder photos, home hero) from hardcoded `/public/*` paths into Cloudinary, with admin UI to upload/delete/replace/reorder — no redeploys.

**Architecture:** Cloudinary is the source of truth (image bytes + `context.custom.sort` metadata). Server endpoints proxy Cloudinary's Admin API for listing/mutating; browser uploads files directly to Cloudinary using server-signed params. No database. No JSON manifest. Slot registry hardcoded in TS for safety.

**Tech Stack:** React 19, TypeScript, react-router-dom v7, Vercel serverless functions, `cloudinary` npm SDK v2, native HTML5 drag-and-drop, iron-session (from Phase 1).

**Branch:** Continue on `feat/admin-auth` (Phase 1 not yet merged). Two phases ship together.

**Tests:** User has waived automated tests for this branch. Manual smoke test plan is in the spec; we run it after T19.

---

## File Structure

```
api/
  images/
    index.ts             # GET — list images in slot (public)
    upload-signature.ts  # POST — admin-only, returns signed Cloudinary upload params
    reorder.ts           # POST — admin-only, updates context.custom.sort
    delete.ts            # POST — admin-only, destroys public_id

src/
  content/
    image-slots.ts       # SLOTS registry: gallery/events/founders/home + slot defs
  lib/
    cloudinary.ts        # server SDK wrapper: signUploadParams, listImages, setImageSort, deleteImage
  components/
    CloudinaryImage.tsx  # public-site image renderer with srcset/transformations
  hooks/
    useSlotImages.ts     # fetch /api/images for a (category, slot)
  pages/
    Gallery.tsx          # MODIFIED: read from useSlotImages, not hardcoded array
    Events.tsx           # MODIFIED: 4 posters use <CloudinaryImage>
    Founders.tsx         # MODIFIED: 2 photos use <CloudinaryImage>
    Home.tsx             # MODIFIED: hero + 3 featured use <CloudinaryImage>
    AdminDashboard.tsx   # MODIFIED: add "Manage Images" card
    admin/
      AdminImages.tsx          # /admin/images — 4 category cards
      AdminImagesCategory.tsx  # /admin/images/:category — slot list
      AdminSlotCollection.tsx  # /admin/images/:category/:slot — collection UI (upload + grid + reorder + delete)
      AdminSlotSingle.tsx      # /admin/images/:category/:slot — single UI (preview + replace)
      AdminSlotRouter.tsx      # picks Collection vs Single based on slot type

scripts/
  migrate-images-to-cloudinary.ts  # one-time local script

docs/
  admin-deploy.md        # MODIFIED: add Cloudinary env vars + migration step

vercel.json              # may need rewrite for deeper /admin/* routes (verify)
.env.local               # add REACT_APP_CLOUDINARY_CLOUD_NAME
.env.local.example       # mirror
package.json             # add cloudinary, tsx (dev) for migration script
src/App.tsx              # MODIFIED: add /admin/images/* routes
```

**Decisions:**
- **Admin pages live under `src/pages/admin/`** so the file tree mirrors the URL tree. Keeps the admin namespace distinct.
- **`AdminSlotRouter` picks Collection vs Single** at runtime based on the slot's `type` field — avoids two parallel routes for what's conceptually one thing.
- **No new state library.** React's `useState` + `useEffect` is enough; cache list responses in component state.
- **Drag-and-drop is native HTML5** (`draggable`, `onDragStart`, `onDrop`). The reorder UI is small enough not to need a library; react-beautiful-dnd is deprecated and dnd-kit is heavy for this.

---

### Task 1: Install Cloudinary SDK and add env config

**Files:**
- Modify: `package.json`
- Modify: `.env.local`
- Modify: `.env.local.example`

- [ ] **Step 1: Install cloudinary SDK**

Run: `npm install cloudinary`
Expected: `package.json` shows `"cloudinary": "^2.x.x"` under `dependencies`.

- [ ] **Step 2: Install tsx (dev dep) for the migration script**

Run: `npm install -D tsx`
Expected: `package.json` shows `tsx` under `devDependencies`.

- [ ] **Step 3: Add `REACT_APP_CLOUDINARY_CLOUD_NAME` to `.env.local`**

Open `/Users/manusettypageloop/Documents/Cowork/Sanskaar montessori/sanskaar-montessori/.env.local`. Add a line at the bottom (you already have CLOUDINARY_CLOUD_NAME=dv7qbvcye there):

```
REACT_APP_CLOUDINARY_CLOUD_NAME=dv7qbvcye
```

(CRA only exposes env vars prefixed with `REACT_APP_` to the browser. The cloud name is needed in the browser to build image URLs.)

- [ ] **Step 4: Mirror to `.env.local.example`**

Open `/.env.local.example`. Append after the existing Cloudinary block:

```
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `Compiled successfully.`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: add cloudinary SDK and tsx, expose cloud name to browser"
```

(Note: `.env.local` is gitignored so no need to stage it.)

---

### Task 2: Slot registry

**Files:**
- Create: `src/content/image-slots.ts`

- [ ] **Step 1: Create the file**

Create `src/content/image-slots.ts`:

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

export const CATEGORIES: Category[] = ['gallery', 'events', 'founders', 'home'];

export function findSlot(
  category: Category,
  slotId: string
): SlotDef | undefined {
  return SLOTS[category].find((s) => s.id === slotId);
}

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export function folderPath(category: Category, slotId: string): string {
  return `sanskaar/${category}/${slotId}`;
}

export function singlePublicId(category: Category, slotId: string): string {
  return `sanskaar/${category}/${slotId}`;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/image-slots.ts
git commit -m "feat: image slot registry (categories, slots, folder helpers)"
```

---

### Task 3: Server-side Cloudinary library

**Files:**
- Create: `src/lib/cloudinary.ts`

- [ ] **Step 1: Create the file**

Create `src/lib/cloudinary.ts`:

```ts
import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  context?: { custom?: { sort?: string; alt?: string } };
};

function ensureConfigured(): void {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new Error(
      'Cloudinary env not configured: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are all required.'
    );
  }
  cloudinary.config({
    cloud_name: cloud,
    api_key: key,
    api_secret: secret,
    secure: true,
  });
}

export type SignUploadInput = {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  defaultSort?: number;
};

export type SignedUploadParams = {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id?: string;
  overwrite?: boolean;
  context?: string;
};

export function signUploadParams(input: SignUploadInput): SignedUploadParams {
  ensureConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number | boolean> = {
    timestamp,
    folder: input.folder,
  };
  if (input.publicId) params.public_id = input.publicId;
  if (input.overwrite) params.overwrite = true;
  if (typeof input.defaultSort === 'number') {
    params.context = `sort=${input.defaultSort}`;
  }
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: input.folder,
    public_id: input.publicId,
    overwrite: input.overwrite,
    context: typeof params.context === 'string' ? params.context : undefined,
  };
}

export async function listImages(folder: string): Promise<CloudinaryResource[]> {
  ensureConfigured();
  const result = await cloudinary.search
    .expression(`folder="${folder}"`)
    .with_field('context')
    .max_results(100)
    .execute();
  const resources = (result.resources ?? []) as CloudinaryResource[];
  return resources.sort((a, b) => {
    const sa = parseInt(a.context?.custom?.sort ?? '0', 10);
    const sb = parseInt(b.context?.custom?.sort ?? '0', 10);
    return sa - sb;
  });
}

export async function setImageSort(
  publicId: string,
  sort: number
): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.add_context({ sort: String(sort) }, [publicId]);
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/cloudinary.ts
git commit -m "feat: server cloudinary helper (sign uploads, list, sort, delete)"
```

---

### Task 4: GET /api/images endpoint

**Files:**
- Create: `api/images/index.ts`

- [ ] **Step 1: Create the handler**

Create `api/images/index.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listImages } from '../../src/lib/cloudinary';
import {
  isValidCategory,
  findSlot,
  folderPath,
  singlePublicId,
} from '../../src/content/image-slots';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = String(req.query.category ?? '');
  const slotId = String(req.query.slot ?? '');

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const slot = findSlot(category, slotId);
  if (!slot) {
    return res.status(400).json({ error: 'Invalid slot' });
  }

  // For both collection and single slots we list the same folder.
  // Single slots will return 0 or 1 image.
  const folder =
    slot.type === 'single'
      ? `sanskaar/${category}` // single: parent folder, then filter by public_id
      : folderPath(category, slotId);

  try {
    const images = await listImages(folder);
    if (slot.type === 'single') {
      const target = singlePublicId(category, slotId);
      const match = images.filter((img) => img.public_id === target);
      return res.status(200).json({ images: match });
    }
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add api/images/index.ts
git commit -m "feat: GET /api/images endpoint (lists slot contents from Cloudinary)"
```

---

### Task 5: POST /api/upload-signature endpoint

**Files:**
- Create: `api/images/upload-signature.ts`

- [ ] **Step 1: Create the handler**

Create `api/images/upload-signature.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { signUploadParams, listImages } from '../../src/lib/cloudinary';
import {
  isValidCategory,
  findSlot,
  folderPath,
  singlePublicId,
} from '../../src/content/image-slots';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { category, slot: slotId } = (req.body ?? {}) as {
    category?: unknown;
    slot?: unknown;
  };

  if (typeof category !== 'string' || typeof slotId !== 'string') {
    return res.status(400).json({ error: 'Missing category or slot' });
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const slot = findSlot(category, slotId);
  if (!slot) {
    return res.status(400).json({ error: 'Invalid slot' });
  }

  try {
    if (slot.type === 'single') {
      const params = signUploadParams({
        folder: `sanskaar/${category}`,
        publicId: singlePublicId(category, slotId),
        overwrite: true,
      });
      return res.status(200).json(params);
    }

    // Collection: pick a default sort = (max existing sort) + 1 so new
    // uploads land at the end of the grid.
    const existing = await listImages(folderPath(category, slotId));
    const maxSort = existing.reduce((m, img) => {
      const s = parseInt(img.context?.custom?.sort ?? '0', 10);
      return s > m ? s : m;
    }, 0);
    const params = signUploadParams({
      folder: folderPath(category, slotId),
      defaultSort: maxSort + 1,
    });
    return res.status(200).json(params);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add api/images/upload-signature.ts
git commit -m "feat: POST /api/images/upload-signature (admin-only signed Cloudinary params)"
```

---

### Task 6: POST /api/images/reorder endpoint

**Files:**
- Create: `api/images/reorder.ts`

- [ ] **Step 1: Create the handler**

Create `api/images/reorder.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { setImageSort } from '../../src/lib/cloudinary';

type Ordering = { public_id: string; sort: number };

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { orderings } = (req.body ?? {}) as { orderings?: unknown };
  if (!Array.isArray(orderings)) {
    return res.status(400).json({ error: 'orderings must be an array' });
  }
  for (const o of orderings as Ordering[]) {
    if (
      typeof o?.public_id !== 'string' ||
      typeof o?.sort !== 'number' ||
      !Number.isFinite(o.sort)
    ) {
      return res
        .status(400)
        .json({ error: 'each ordering needs public_id (string) and sort (number)' });
    }
  }

  try {
    await Promise.all(
      (orderings as Ordering[]).map((o) => setImageSort(o.public_id, o.sort))
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add api/images/reorder.ts
git commit -m "feat: POST /api/images/reorder (updates context.sort)"
```

---

### Task 7: POST /api/images/delete endpoint

**Files:**
- Create: `api/images/delete.ts`

- [ ] **Step 1: Create the handler**

Create `api/images/delete.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { deleteImage } from '../../src/lib/cloudinary';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { public_id } = (req.body ?? {}) as { public_id?: unknown };
  if (typeof public_id !== 'string' || public_id.length === 0) {
    return res.status(400).json({ error: 'public_id is required' });
  }
  if (!public_id.startsWith('sanskaar/')) {
    return res.status(400).json({ error: 'public_id must be in sanskaar/' });
  }

  try {
    await deleteImage(public_id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add api/images/delete.ts
git commit -m "feat: POST /api/images/delete (admin-only Cloudinary destroy)"
```

---

### Task 8: <CloudinaryImage> component

**Files:**
- Create: `src/components/CloudinaryImage.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/CloudinaryImage.tsx`:

```tsx
import React from 'react';

const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME ?? '';
const BASE = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const WIDTHS = [400, 800, 1200, 1600];

type Props = {
  publicId: string;
  alt: string;
  width?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  fit?: 'fill' | 'fit';
};

function buildUrl(publicId: string, w: number, fit: 'fill' | 'fit'): string {
  const c = fit === 'fill' ? 'c_fill' : 'c_fit';
  return `${BASE}/${c},w_${w},q_auto,f_auto/${publicId}`;
}

const CloudinaryImage: React.FC<Props> = ({
  publicId,
  alt,
  width = 800,
  className,
  loading = 'lazy',
  fit = 'fill',
}) => {
  if (!CLOUD) {
    return (
      <div className={className} style={{ background: '#eee', padding: '1rem' }}>
        Cloudinary cloud name not configured.
      </div>
    );
  }
  const srcSet = WIDTHS.map((w) => `${buildUrl(publicId, w, fit)} ${w}w`).join(', ');
  return (
    <img
      src={buildUrl(publicId, width, fit)}
      srcSet={srcSet}
      sizes={`(max-width: 768px) 100vw, ${width}px`}
      alt={alt}
      loading={loading}
      className={className}
    />
  );
};

export default CloudinaryImage;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CloudinaryImage.tsx
git commit -m "feat: CloudinaryImage component with srcset and auto format"
```

---

### Task 9: useSlotImages hook

**Files:**
- Create: `src/hooks/useSlotImages.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useSlotImages.ts`:

```ts
import { useEffect, useState, useCallback } from 'react';
import type { Category } from '../content/image-slots';

export type SlotImage = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
};

type State =
  | { status: 'loading' }
  | { status: 'success'; images: SlotImage[] }
  | { status: 'error'; error: string };

export function useSlotImages(category: Category, slotId: string) {
  const [state, setState] = useState<State>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(
        `/api/images?category=${encodeURIComponent(category)}&slot=${encodeURIComponent(slotId)}`,
        { credentials: 'same-origin' }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ status: 'error', error: body.error ?? `HTTP ${res.status}` });
        return;
      }
      const data = (await res.json()) as { images: SlotImage[] };
      setState({ status: 'success', images: data.images });
    } catch (err) {
      setState({ status: 'error', error: (err as Error).message });
    }
  }, [category, slotId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSlotImages.ts
git commit -m "feat: useSlotImages hook (fetch /api/images)"
```

---

### Task 10: Migrate Gallery page to Cloudinary

**Files:**
- Modify: `src/pages/Gallery.tsx` (full rewrite)

- [ ] **Step 1: Read current Gallery.tsx for any non-image structure to preserve**

Run: `cat src/pages/Gallery.tsx | head -120`
Expected: prints the existing component. Note the surrounding structure (page header, section markup, classnames). The plan replaces the hardcoded image arrays only — preserve every other element.

- [ ] **Step 2: Replace `src/pages/Gallery.tsx` with this:**

```tsx
import React from 'react';
import CloudinaryImage from '../components/CloudinaryImage';
import { useSlotImages } from '../hooks/useSlotImages';
import { SLOTS, type SlotDef } from '../content/image-slots';

const SectionGrid: React.FC<{ slot: SlotDef }> = ({ slot }) => {
  const { state } = useSlotImages('gallery', slot.id);
  if (state.status === 'loading') {
    return <div className="gallery-empty">Loading…</div>;
  }
  if (state.status === 'error') {
    return <div className="gallery-empty">Could not load: {state.error}</div>;
  }
  if (state.images.length === 0) {
    return <div className="gallery-empty">No photos yet.</div>;
  }
  return (
    <div className="gallery-grid">
      {state.images.map((img) => (
        <div key={img.public_id} className="gallery-item">
          <CloudinaryImage publicId={img.public_id} alt={slot.label} width={800} />
        </div>
      ))}
    </div>
  );
};

const Gallery: React.FC = () => {
  return (
    <>
      <div className="page-header">
        <h1>Gallery</h1>
        <p>Moments from life at Sanskaar Montessori</p>
      </div>
      {SLOTS.gallery.map((slot, idx) => (
        <div key={slot.id} className={idx % 2 === 0 ? '' : 'section-alt'}>
          <section className="section">
            <h2>{slot.label}</h2>
            <SectionGrid slot={slot} />
          </section>
        </div>
      ))}

      <div className="cta-banner">
        <h2>Visit Us</h2>
        <p>We'd love to show you around.</p>
        <a
          href="https://share.google/QyuzA210g7jqGHGS4"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta"
        >
          Get Directions
        </a>
      </div>
    </>
  );
};

export default Gallery;
```

(If the original Gallery.tsx had additional wrapping markup or different CTA wording, preserve that — diff by hand against the file you read in Step 1.)

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Gallery.tsx
git commit -m "feat: Gallery page reads from Cloudinary via useSlotImages"
```

---

### Task 11: Migrate Events page posters

**Files:**
- Modify: `src/pages/Events.tsx`

- [ ] **Step 1: Find each `<img>` referencing `/gallery/...` or `/summer_camp.jpg`**

Run: `grep -n "<img" src/pages/Events.tsx`
Expected: 4 lines showing the 4 hardcoded image tags.

- [ ] **Step 2: Replace each `<img>` with a `<CloudinaryImage>` call**

For each of the 4, swap the `src=` to use `<CloudinaryImage>`. Mappings:

| Old `src` | New |
|---|---|
| `/summer_camp.jpg` | `<CloudinaryImage publicId="sanskaar/events/summer-camp" alt="Sanskaar Montessori Summer Camp 2026" width={800} />` |
| `/gallery/admissions-01.jpg` | `<CloudinaryImage publicId="sanskaar/events/admissions" alt="Sanskaar Montessori Admissions 2026-2027" width={800} />` |
| `/gallery/day-care-programme.jpg` | `<CloudinaryImage publicId="sanskaar/events/day-care" alt="Day Care Programme" width={800} />` |
| `/gallery/after-school-programme.jpg` | `<CloudinaryImage publicId="sanskaar/events/after-school" alt="After School Programme" width={800} />` |

Add the import at the top of the file:
```tsx
import CloudinaryImage from '../components/CloudinaryImage';
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Events.tsx
git commit -m "feat: Events page posters from Cloudinary"
```

---

### Task 12: Migrate Founders page

**Files:**
- Modify: `src/pages/Founders.tsx`

- [ ] **Step 1: Replace the two `<img>` tags**

Open `src/pages/Founders.tsx`. Add at the top of imports:
```tsx
import CloudinaryImage from '../components/CloudinaryImage';
```

Replace `<img src="/sushma.jpg" alt="..." />` with:
```tsx
<CloudinaryImage publicId="sanskaar/founders/sushma" alt="Smt. Sushma Nagendra" width={600} fit="fit" />
```

Replace `<img src="/shwetha.jpg" alt="..." />` with:
```tsx
<CloudinaryImage publicId="sanskaar/founders/shwetha" alt="Smt. Shwetha V" width={600} fit="fit" />
```

(Preserve the surrounding markup and any classes the originals had.)

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Founders.tsx
git commit -m "feat: Founder photos from Cloudinary"
```

---

### Task 13: Migrate Home page hero + featured photos

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Replace the inline hero background-image url**

The current Home.tsx contains a CSS gradient layered over `url("/gallery/mathematics-03.jpg")`. Replace that URL with a Cloudinary URL string built inline. Find the line containing:

```tsx
'linear-gradient(135deg, ..., url("/gallery/mathematics-03.jpg")',
```

Replace with:

```tsx
`linear-gradient(135deg, rgba(27, 94, 32, 0.85) 0%, rgba(56, 142, 60, 0.72) 40%, rgba(25, 118, 210, 0.78) 100%), url("https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_1600,q_auto,f_auto/sanskaar/home/hero")`,
```

Note: this is a backtick-quoted template literal, replacing the original single-quoted string.

- [ ] **Step 2: Replace the 3 featured `<img>` tags**

Add import:
```tsx
import CloudinaryImage from '../components/CloudinaryImage';
```

Replace:
- `<img src="/gallery/mathematics-03.jpg" ... />` → `<CloudinaryImage publicId="sanskaar/home/hero" alt="Children at Sanskaar Montessori" width={600} loading="lazy" />`
- `<img src="/gallery/language-kannada-02.jpg" ... />` → `<CloudinaryImage publicId="sanskaar/gallery/language/<random>" ... />`

For the two non-hero featured images, we need the actual Cloudinary public_ids that the migration script generates. Two ways to handle:
1. **Hardcode them after migration** — run T14 first, look up the public_ids, paste them here.
2. **Dynamically pick the first image of a slot** — use `useSlotImages('gallery', 'language')` and render `state.images[0]`.

Use approach **(2)** to avoid the hardcoded coupling. Replace the 2nd and 3rd featured image blocks with:

```tsx
const langPick = useSlotImages('gallery', 'language');
const gardenPick = useSlotImages('gallery', 'gardening');
// ...
{langPick.state.status === 'success' && langPick.state.images[0] && (
  <CloudinaryImage
    publicId={langPick.state.images[0].public_id}
    alt="Hands-on Montessori activities"
    width={600}
    loading="lazy"
  />
)}
{gardenPick.state.status === 'success' && gardenPick.state.images[0] && (
  <CloudinaryImage
    publicId={gardenPick.state.images[0].public_id}
    alt="Joyful learning moments"
    width={600}
    loading="lazy"
  />
)}
```

(For the first featured image, just use the home/hero slot directly — no hook needed.)

Also import the hook:
```tsx
import { useSlotImages } from '../hooks/useSlotImages';
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: Home hero + featured images from Cloudinary"
```

---

### Task 14: Migration script

**Files:**
- Create: `scripts/migrate-images-to-cloudinary.ts`

- [ ] **Step 1: Create the script**

Create `scripts/migrate-images-to-cloudinary.ts`:

```ts
/**
 * One-time migration: upload existing /public images to Cloudinary slots.
 * Run with: set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
 *
 * Idempotent — re-running skips files already uploaded (by public_id).
 */
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const ROOT = path.resolve(__dirname, '..', 'public');

type CollectionSpec = { folder: string; files: string[] };
type SingleSpec = { publicId: string; file: string };

const COLLECTIONS: CollectionSpec[] = [
  { folder: 'sanskaar/gallery/classroom',      files: ['gallery/classroom-01.jpg', 'gallery/classroom-02.jpg', 'gallery/classroom-03.jpg'] },
  { folder: 'sanskaar/gallery/practical-life', files: ['gallery/practical-life-01.jpg', 'gallery/practical-life-02.jpg'] },
  { folder: 'sanskaar/gallery/language',       files: ['gallery/language-kannada-02.jpg', 'gallery/language-english-02.jpg'] },
  { folder: 'sanskaar/gallery/mathematics',    files: ['gallery/mathematics-01.jpg', 'gallery/mathematics-02.jpg', 'gallery/mathematics-03.jpg'] },
  { folder: 'sanskaar/gallery/geography',      files: ['gallery/geography-01.jpg', 'gallery/geography-02.jpg'] },
  { folder: 'sanskaar/gallery/art-craft',      files: ['gallery/art-craft-01.jpg', 'gallery/art-craft-02.jpg'] },
  { folder: 'sanskaar/gallery/story-time',     files: ['gallery/story-time-01.jpg', 'gallery/story-time-02.jpg', 'gallery/story-time-03.jpg'] },
  { folder: 'sanskaar/gallery/gardening',      files: ['gallery/gardening-01.jpg', 'gallery/gardening-02.jpg', 'gallery/gardening-03.jpg'] },
];

const SINGLES: SingleSpec[] = [
  { publicId: 'sanskaar/events/summer-camp',  file: 'summer_camp.jpg' },
  { publicId: 'sanskaar/events/admissions',   file: 'gallery/admissions-01.jpg' },
  { publicId: 'sanskaar/events/day-care',     file: 'gallery/day-care-programme.jpg' },
  { publicId: 'sanskaar/events/after-school', file: 'gallery/after-school-programme.jpg' },
  { publicId: 'sanskaar/founders/sushma',     file: 'sushma.jpg' },
  { publicId: 'sanskaar/founders/shwetha',    file: 'shwetha.jpg' },
  { publicId: 'sanskaar/home/hero',           file: 'gallery/mathematics-03.jpg' },
];

async function exists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch {
    return false;
  }
}

async function uploadCollection(spec: CollectionSpec): Promise<void> {
  console.log(`\n=== ${spec.folder} ===`);
  for (let i = 0; i < spec.files.length; i++) {
    const filePath = path.join(ROOT, spec.files[i]);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (missing file): ${spec.files[i]}`);
      continue;
    }
    const sort = i + 1;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: spec.folder,
      context: `sort=${sort}`,
      overwrite: false,
      resource_type: 'image',
    });
    console.log(`  uploaded sort=${sort}: ${result.public_id}`);
  }
}

async function uploadSingle(spec: SingleSpec): Promise<void> {
  const filePath = path.join(ROOT, spec.file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (missing file): ${spec.file}`);
    return;
  }
  if (await exists(spec.publicId)) {
    console.log(`SKIP (already uploaded): ${spec.publicId}`);
    return;
  }
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: spec.publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`uploaded single: ${result.public_id}`);
}

async function main(): Promise<void> {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET not set — did you `source .env.local`?');
  }
  console.log('Migrating images to Cloudinary…');
  for (const c of COLLECTIONS) await uploadCollection(c);
  console.log('\n=== Singles ===');
  for (const s of SINGLES) await uploadSingle(s);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run the migration locally**

Run:
```bash
set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
```

Expected: prints upload lines for ~31 images. No "ERROR" lines.

- [ ] **Step 4: Spot-check on Cloudinary dashboard**

Open Cloudinary → Media Library. Navigate into `sanskaar/`. Confirm the folder structure matches the spec (gallery/8 categories with photos, events/4 singles, founders/2 singles, home/hero).

- [ ] **Step 5: Commit the script**

```bash
git add scripts/migrate-images-to-cloudinary.ts
git commit -m "chore: one-time migration script for /public → Cloudinary"
```

(The script stays in the repo as a record of how migration was done. It's idempotent so safe to re-run if needed.)

---

### Task 15: Admin entry — dashboard card + /admin/images list

**Files:**
- Modify: `src/pages/AdminDashboard.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/admin/AdminImages.tsx`

- [ ] **Step 1: Add "Manage Images" card to AdminDashboard**

Open `src/pages/AdminDashboard.tsx`. Inside the `<main>` block, replace the placeholder paragraph with:

```tsx
<main style={styles.main}>
  <a href="/admin/images" style={styles.card}>
    <div style={styles.cardEmoji}>🖼️</div>
    <div>
      <div style={styles.cardTitle}>Manage Images</div>
      <div style={styles.cardSub}>Gallery, events, founders, home</div>
    </div>
  </a>
</main>
```

Add to `styles`:
```tsx
card: {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem 1.25rem',
  border: '1px solid #e6e6e6',
  borderRadius: 10,
  background: '#fff',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  maxWidth: 420,
},
cardEmoji: { fontSize: 28 },
cardTitle: { fontWeight: 600, fontSize: 16 },
cardSub: { fontSize: 13, color: '#666' },
```

- [ ] **Step 2: Create `src/pages/admin/AdminImages.tsx`**

Create the file:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, SLOTS } from '../../content/image-slots';

const labels: Record<string, string> = {
  gallery: 'Gallery',
  events: 'Events',
  founders: 'Founders',
  home: 'Home',
};

const AdminImages: React.FC = () => {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Manage Images</h1>
        <Link to="/admin" style={styles.back}>← Back to Admin</Link>
      </header>
      <div style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Link key={cat} to={`/admin/images/${cat}`} style={styles.card}>
            <div style={styles.cardTitle}>{labels[cat]}</div>
            <div style={styles.cardSub}>{SLOTS[cat].length} slot{SLOTS[cat].length === 1 ? '' : 's'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    display: 'block',
    padding: '1.25rem',
    border: '1px solid #e6e6e6',
    borderRadius: 10,
    background: '#fff',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666' },
};

export default AdminImages;
```

- [ ] **Step 3: Wire route in App.tsx**

Open `src/App.tsx`. In the `<Route element={<AdminLayout />}>` block, add:

```tsx
<Route path="/admin/images" element={<AdminImages />} />
```

Add the import at top:
```tsx
import AdminImages from './pages/admin/AdminImages';
```

Also wrap the route in an auth guard. The simplest pattern: AdminImages internally uses the same `useAdminAuth`-backed redirect that `Admin.tsx` does. Add at top of `AdminImages.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
```

Add at the top of the AdminImages function body:

```tsx
const { state } = useAdminAuth();
const navigate = useNavigate();
useEffect(() => {
  if (state.status === 'unauthenticated') {
    navigate('/admin/login', { replace: true });
  }
}, [state, navigate]);
if (state.status !== 'authenticated') {
  return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/AdminDashboard.tsx src/pages/admin/AdminImages.tsx
git commit -m "feat: admin dashboard card + /admin/images category list"
```

---

### Task 16: Admin /admin/images/:category page

**Files:**
- Create: `src/pages/admin/AdminImagesCategory.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the page**

Create `src/pages/admin/AdminImagesCategory.tsx`:

```tsx
import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { SLOTS, isValidCategory } from '../../content/image-slots';

const AdminImagesCategory: React.FC = () => {
  const { category = '' } = useParams<{ category: string }>();
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  }
  if (!isValidCategory(category)) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Unknown category.</div>;
  }

  const slots = SLOTS[category];

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{category[0].toUpperCase() + category.slice(1)}</h1>
        <Link to="/admin/images" style={styles.back}>← All categories</Link>
      </header>
      <div style={styles.grid}>
        {slots.map((slot) => (
          <Link
            key={slot.id}
            to={`/admin/images/${category}/${slot.id}`}
            style={styles.card}
          >
            <div style={styles.cardTitle}>{slot.label}</div>
            <div style={styles.cardSub}>{slot.type === 'collection' ? 'Multiple photos' : 'Single image'}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: 0, textTransform: 'capitalize' },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    display: 'block',
    padding: '1.25rem',
    border: '1px solid #e6e6e6',
    borderRadius: 10,
    background: '#fff',
    textDecoration: 'none',
    color: 'inherit',
  },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666' },
};

export default AdminImagesCategory;
```

- [ ] **Step 2: Wire the route in App.tsx**

In `src/App.tsx` admin block, add:

```tsx
<Route path="/admin/images/:category" element={<AdminImagesCategory />} />
```

Import:
```tsx
import AdminImagesCategory from './pages/admin/AdminImagesCategory';
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/admin/AdminImagesCategory.tsx
git commit -m "feat: admin category page (list slots in a category)"
```

---

### Task 17: Admin slot router (Collection vs Single)

**Files:**
- Create: `src/pages/admin/AdminSlotRouter.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the router**

Create `src/pages/admin/AdminSlotRouter.tsx`:

```tsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { findSlot, isValidCategory } from '../../content/image-slots';
import AdminSlotCollection from './AdminSlotCollection';
import AdminSlotSingle from './AdminSlotSingle';

const AdminSlotRouter: React.FC = () => {
  const { category = '', slot: slotId = '' } = useParams<{
    category: string;
    slot: string;
  }>();
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status !== 'authenticated') {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>;
  }
  if (!isValidCategory(category)) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Unknown category.</div>;
  }
  const slot = findSlot(category, slotId);
  if (!slot) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Unknown slot.</div>;
  }

  if (slot.type === 'single') {
    return <AdminSlotSingle category={category} slot={slot} />;
  }
  return <AdminSlotCollection category={category} slot={slot} />;
};

export default AdminSlotRouter;
```

- [ ] **Step 2: Wire route in App.tsx**

```tsx
<Route path="/admin/images/:category/:slot" element={<AdminSlotRouter />} />
```

Import:
```tsx
import AdminSlotRouter from './pages/admin/AdminSlotRouter';
```

- [ ] **Step 3: Don't compile yet — Collection and Single don't exist (next tasks)**

Skip the tsc check until T18 + T19 land. Don't commit yet either.

---

### Task 18: Admin collection slot (upload + grid + delete + reorder)

**Files:**
- Create: `src/pages/admin/AdminSlotCollection.tsx`

- [ ] **Step 1: Create the component**

Create `src/pages/admin/AdminSlotCollection.tsx`:

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages, type SlotImage } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';

type Props = { category: Category; slot: SlotDef };

const AdminSlotCollection: React.FC<Props> = ({ category, slot }) => {
  const { state, refresh } = useSlotImages(category, slot.id);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so same file can be re-picked
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const sigRes = await fetch('/api/images/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ category, slot: slot.id }),
      });
      if (!sigRes.ok) throw new Error('Could not get upload signature');
      const sig = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        context?: string;
      };

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.api_key);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      if (sig.context) fd.append('context', sig.context);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
        { method: 'POST', body: fd }
      );
      if (!upRes.ok) {
        const txt = await upRes.text();
        throw new Error(`Cloudinary upload failed: ${txt}`);
      }
      await refresh();
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (publicId: string) => {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!res.ok) throw new Error('Delete failed');
      await refresh();
    } catch (err) {
      window.alert((err as Error).message);
    }
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = useCallback(
    async (targetId: string) => {
      if (!dragId || dragId === targetId || state.status !== 'success') return;
      const order = state.images.map((i) => i.public_id);
      const fromIdx = order.indexOf(dragId);
      const toIdx = order.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragId);
      const orderings = order.map((public_id, i) => ({ public_id, sort: i + 1 }));
      setDragId(null);
      try {
        const res = await fetch('/api/images/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ orderings }),
        });
        if (!res.ok) throw new Error('Reorder failed');
        await refresh();
      } catch (err) {
        window.alert((err as Error).message);
      }
    },
    [dragId, state, refresh]
  );

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{slot.label}</h1>
        <Link to={`/admin/images/${category}`} style={styles.back}>
          ← Back to {category}
        </Link>
      </header>

      <div style={styles.controls}>
        <button
          style={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '⬆ Upload photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFilePick}
        />
        {uploadError && <span style={styles.error}>{uploadError}</span>}
      </div>

      {state.status === 'loading' && <div>Loading…</div>}
      {state.status === 'error' && <div style={styles.error}>{state.error}</div>}
      {state.status === 'success' && state.images.length === 0 && (
        <div style={styles.empty}>No photos yet. Upload to get started.</div>
      )}
      {state.status === 'success' && state.images.length > 0 && (
        <div style={styles.grid}>
          {state.images.map((img: SlotImage) => (
            <div
              key={img.public_id}
              style={styles.card}
              draggable
              onDragStart={() => onDragStart(img.public_id)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(img.public_id)}
            >
              <CloudinaryImage publicId={img.public_id} alt={slot.label} width={400} />
              <button style={styles.deleteBtn} onClick={() => onDelete(img.public_id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <p style={styles.hint}>Tip: drag a photo onto another to reorder.</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  controls: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  uploadBtn: {
    padding: '10px 16px',
    background: '#3a6a3a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    position: 'relative',
    border: '1px solid #e6e6e6',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
    cursor: 'grab',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  empty: { padding: '2rem', textAlign: 'center', color: '#999', border: '1px dashed #ddd', borderRadius: 8 },
  error: { color: '#b00020', fontSize: 14 },
  hint: { fontSize: 13, color: '#999', marginTop: '1.5rem' },
};

export default AdminSlotCollection;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: errors only about missing `AdminSlotSingle` (T19 lands it).

- [ ] **Step 3: Hold off on commit until T19 is done**

---

### Task 19: Admin single slot (preview + replace)

**Files:**
- Create: `src/pages/admin/AdminSlotSingle.tsx`

- [ ] **Step 1: Create the component**

Create `src/pages/admin/AdminSlotSingle.tsx`:

```tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../../components/CloudinaryImage';
import { useSlotImages } from '../../hooks/useSlotImages';
import type { Category, SlotDef } from '../../content/image-slots';

type Props = { category: Category; slot: SlotDef };

const AdminSlotSingle: React.FC<Props> = ({ category, slot }) => {
  const { state, refresh } = useSlotImages(category, slot.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const sigRes = await fetch('/api/images/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ category, slot: slot.id }),
      });
      if (!sigRes.ok) throw new Error('Could not get upload signature');
      const sig = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        public_id: string;
        overwrite: boolean;
      };

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.api_key);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      fd.append('folder', sig.folder);
      fd.append('public_id', sig.public_id);
      fd.append('overwrite', 'true');

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/auto/upload`,
        { method: 'POST', body: fd }
      );
      if (!upRes.ok) {
        const txt = await upRes.text();
        throw new Error(`Cloudinary upload failed: ${txt}`);
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const current =
    state.status === 'success' && state.images.length > 0 ? state.images[0] : null;

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>{slot.label}</h1>
        <Link to={`/admin/images/${category}`} style={styles.back}>
          ← Back to {category}
        </Link>
      </header>

      {state.status === 'loading' && <div>Loading…</div>}
      {state.status === 'error' && <div style={styles.error}>{state.error}</div>}
      {state.status === 'success' && (
        <>
          <div style={styles.preview}>
            {current ? (
              <CloudinaryImage publicId={current.public_id} alt={slot.label} width={800} fit="fit" />
            ) : (
              <div style={styles.empty}>No image yet — upload to set this slot.</div>
            )}
          </div>
          <div style={styles.controls}>
            <button
              style={styles.replaceBtn}
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? 'Uploading…' : current ? '⬆ Replace image' : '⬆ Upload image'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onFilePick}
            />
            {error && <span style={styles.error}>{error}</span>}
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 720, margin: '2rem auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0 },
  back: { fontSize: 14, color: '#3a6a3a', textDecoration: 'none' },
  preview: {
    border: '1px solid #e6e6e6',
    borderRadius: 8,
    padding: '1rem',
    background: '#fff',
    minHeight: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  controls: { display: 'flex', alignItems: 'center', gap: '1rem' },
  replaceBtn: {
    padding: '10px 16px',
    background: '#3a6a3a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  empty: { color: '#999' },
  error: { color: '#b00020', fontSize: 14 },
};

export default AdminSlotSingle;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors. (T17 router + T18 collection + T19 single now all resolve.)

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: `Compiled successfully.`

- [ ] **Step 4: Commit T17 + T18 + T19 together**

```bash
git add src/App.tsx src/pages/admin/AdminSlotRouter.tsx src/pages/admin/AdminSlotCollection.tsx src/pages/admin/AdminSlotSingle.tsx
git commit -m "feat: admin slot management (collection grid + single replace)"
```

---

### Task 20: Cleanup /public + update deploy doc

**Files:**
- Delete: various `/public/*.jpg` and `/public/gallery/*.jpg`
- Modify: `docs/admin-deploy.md`

- [ ] **Step 1: Verify the migration was successful**

Open the Cloudinary dashboard. Walk through `sanskaar/gallery/{8 categories}` and confirm each has the expected number of photos. Also confirm `events/`, `founders/`, `home/` have their singles.

If anything is missing, re-run the migration script (Task 14, Step 3) — it's idempotent.

- [ ] **Step 2: Run the local site (vercel dev) and visually confirm pages load**

```bash
set -a && source .env.local && set +a && npx vercel dev --listen 3000 --yes
```

Visit `http://localhost:3000/`, `/gallery`, `/events`, `/founders`. All images should load via `res.cloudinary.com` (verify in DevTools → Network → filter on `cloudinary`).

- [ ] **Step 3: Delete unused files**

```bash
git rm public/banner.jpg public/poster.jpg
git rm public/summer_camp.jpg public/sushma.jpg public/shwetha.jpg
git rm -r public/gallery
```

- [ ] **Step 4: Confirm logo/favicon assets are still present**

Run: `ls public/`
Expected: includes `logo.jpg`, `logo192.png`, `logo512.png`, `favicon.ico`, `manifest.json`, `index.html`, `robots.txt`. These stay.

- [ ] **Step 5: Update `docs/admin-deploy.md`**

Read the file:
```bash
cat docs/admin-deploy.md
```

Update the env vars table to add the four Cloudinary vars. Replace the existing env table with:

```markdown
| Name                              | Example                                    | Notes                                       |
|-----------------------------------|--------------------------------------------|---------------------------------------------|
| `ADMIN_PASSWORD`                  | (chosen by client)                         | Single shared password for both phones      |
| `ADMIN_PHONES`                    | `+919113805407,+918105358074`              | Comma-separated, normalized E.164 format    |
| `SESSION_SECRET`                  | generate with `openssl rand -hex 32`       | At least 32 chars; do not reuse across envs |
| `CLOUDINARY_CLOUD_NAME`           | from Cloudinary dashboard                  | Public, also exposed to browser as below    |
| `CLOUDINARY_API_KEY`              | from Cloudinary dashboard                  | Server-only                                 |
| `CLOUDINARY_API_SECRET`           | from Cloudinary dashboard                  | **Server-only** — never expose              |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | same value as `CLOUDINARY_CLOUD_NAME`      | CRA exposes only `REACT_APP_*` to browser   |
```

Also add a new section before "Resetting the password":

```markdown
## Initial migration of images (one time)

Before the first deploy, all images live in `/public/*`. After Phase 2,
they're in Cloudinary. Run the migration script locally with your real
Cloudinary creds in `.env.local`:

\`\`\`bash
set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
\`\`\`

The script is idempotent — re-running skips files already uploaded by
public_id. Verify in the Cloudinary dashboard before deploying.
```

(escape the backticks above when actually editing the file — the markdown shown here uses `\`` to render the fence)

- [ ] **Step 6: Verify build still succeeds**

Run: `npm run build`
Expected: `Compiled successfully.`

- [ ] **Step 7: Commit**

```bash
git add docs/admin-deploy.md public/
git commit -m "chore: drop migrated /public images and document Cloudinary deploy"
```

- [ ] **Step 8: Final review**

Run: `git log --oneline master..HEAD`
Expected: ~20 commits since master covering Phase 1 + Phase 2.

Run a complete walk through the spec's "Test plan (manual)" section — all 20 checks. If anything fails, debug and re-commit fixes before declaring done.

---

## Out of scope (verify NOT in this PR)

- Editing event titles / dates / text → **Phase 2.5**
- Editing phone numbers, page copy → **Phase 3**
- New gallery categories or new event slots from the UI
- Bulk upload / bulk delete
- Image cropping in admin
- Caption / alt text editing in admin
- Audit log of who changed what
- Roles / permissions
