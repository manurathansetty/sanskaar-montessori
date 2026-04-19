# Admin Auth — Deployment Notes

## Required env vars (set in Vercel dashboard)

In **Vercel project → Settings → Environment Variables**, add three vars to
**both** Preview and Production scopes (Vercel does not copy between scopes —
you must add each var twice if you want it in both):

| Name             | Example                                    | Notes                                       |
|------------------|--------------------------------------------|---------------------------------------------|
| `ADMIN_PASSWORD` | (chosen by client)                         | Single shared password for both phones      |
| `ADMIN_PHONES`   | `+919113805407,+918105358074`              | Comma-separated, normalized E.164 format    |
| `SESSION_SECRET` | generate with `openssl rand -hex 32`       | At least 32 chars; do not reuse across envs |

After saving, redeploy the project for the new vars to take effect.

If `ADMIN_PASSWORD` or `ADMIN_PHONES` is missing at request time, `/api/login`
returns HTTP 500 `{"error":"Server misconfigured"}` — the door fails closed
rather than open.

## Local dev

1. Copy `.env.local.example` to `.env.local` and fill in real values.
2. Run `npm run dev` (which runs `vercel dev`) — serves CRA + API routes on
   a single port (default 3000).
3. Visit `http://localhost:3000/admin` — should redirect to `/admin/login`.

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
