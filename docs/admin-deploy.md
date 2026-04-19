# Admin Auth — Deployment Notes

## Required env vars (set in Vercel dashboard)

In **Vercel project → Settings → Environment Variables**, add the vars below
to **both** Preview and Production scopes (Vercel does not copy between scopes —
you must add each var twice if you want it in both):

| Name                              | Example                                    | Notes                                       |
|-----------------------------------|--------------------------------------------|---------------------------------------------|
| `ADMIN_PASSWORD`                  | (chosen by client)                         | Single shared password for both phones      |
| `ADMIN_PHONES`                    | `+919113805407,+918105358074`              | Comma-separated, normalized E.164 format    |
| `SESSION_SECRET`                  | generate with `openssl rand -hex 32`       | At least 32 chars; do not reuse across envs |
| `CLOUDINARY_CLOUD_NAME`           | from Cloudinary dashboard                  | Public, also exposed to browser as below    |
| `CLOUDINARY_API_KEY`              | from Cloudinary dashboard                  | Server-only                                 |
| `CLOUDINARY_API_SECRET`           | from Cloudinary dashboard                  | **Server-only** — never expose              |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | same value as `CLOUDINARY_CLOUD_NAME`      | CRA exposes only `REACT_APP_*` to browser   |

After saving, redeploy the project for the new vars to take effect.

If `ADMIN_PASSWORD` or `ADMIN_PHONES` is missing at request time, `/api/login`
returns HTTP 500 `{"error":"Server misconfigured"}` — the door fails closed
rather than open.

## Local dev

1. Copy `.env.local.example` to `.env.local` and fill in real values.
2. Run `npm run dev` (which runs `vercel dev`) — serves CRA + API routes on
   a single port (default 3000).
3. Visit `http://localhost:3000/admin` — should redirect to `/admin/login`.

## Initial migration of images (one-time, already done)

The original `/public/*.jpg` images were migrated to Cloudinary on
2026-04-20 (commit `3b79584`). The migration script lives at
`scripts/migrate-images-to-cloudinary.ts` for the historical record.

To re-run (idempotent — singles will skip already-uploaded slots; collections
will create additional photos in each folder):

```bash
set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
```

## Image management workflow (post-migration)

All site images now live in Cloudinary under `sanskaar/`:
- `sanskaar/gallery/<category>/...` — collection slots, multiple photos per folder
- `sanskaar/events/<slot>` — single slots (summer-camp, admissions, day-care, after-school)
- `sanskaar/founders/<slot>` — single slots (sushma, shwetha)
- `sanskaar/home/hero` — home hero

Admin manages images via `/admin/images` after logging in. Public-site reads
go through `/api/images` (no admin session needed) → Cloudinary's Search API.

## Post-deploy verification (Vercel preview)

After the first preview deploy with env vars set, run these checks against
the Preview URL (replace `PREVIEW_URL` with the URL Vercel gives you):

1. **SPA fallback works on hard refresh:**
   Open `PREVIEW_URL/admin/login` directly in the browser address bar (not
   from a link). It should render the login page, not a Vercel 404. The
   `vercel.json` rewrite at the repo root handles this.

2. **API responds:**
   ```bash
   curl -i -X POST PREVIEW_URL/api/login \
     -H "Content-Type: application/json" \
     -d '{"phone":"9113805407","password":"<your real password>"}'
   ```
   Expected: HTTP 200, `Set-Cookie: sm_admin_session=...`, body
   `{"phone":"+919113805407"}`. If you get HTTP 500 with
   `{"error":"Server misconfigured"}`, the env vars aren't set on the
   Preview scope.

3. **Wrong creds rejected:**
   ```bash
   curl -i -X POST PREVIEW_URL/api/login \
     -H "Content-Type: application/json" \
     -d '{"phone":"9113805407","password":"wrong"}'
   ```
   Expected: HTTP 401.

4. **End-to-end browser flow:** visit `PREVIEW_URL/admin/login`, sign in
   with a valid mobile + password, expect redirect to `/admin` showing the
   dashboard. Click "Log out" and confirm redirect back to login.

## Resetting the password

Change `ADMIN_PASSWORD` in Vercel dashboard → redeploy. Existing sessions
remain valid until their 24-hour expiry; if you need to force logout
immediately, also rotate `SESSION_SECRET` (this invalidates all cookies).

## Adding a third admin phone

Edit `ADMIN_PHONES` env var, append the new normalized number with a comma
separator, redeploy. No code change.
