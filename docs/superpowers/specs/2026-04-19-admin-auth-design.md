# Admin Auth — Design Spec

**Date:** 2026-04-19
**Branch:** `feat/admin-auth`
**Status:** Draft, pending user approval

## Goal

Add a password-protected `/admin` route to the Sanskaar Montessori site so the
client (school staff) can later edit content and upload photos without
involving a developer. This spec covers **only the locked door**: login,
session, logout, and a placeholder dashboard. What admin actually *does* is
out of scope for this branch.

Two staff phone numbers are valid logins, both share a single password.

## Non-goals

- Editing events, phone, or other site content (separate branch)
- Uploading photos / Cloudinary integration (separate branch)
- Per-user passwords, password reset flow, audit log, multi-tenant
- Role-based permissions (only one role: admin)

## Architecture

CRA frontend + Vercel serverless functions. The site is already deployed on
Vercel, so adding `/api/*.ts` files is the lowest-friction path. No new
infrastructure.

```
Browser                                Vercel
  │                                      │
  │  POST /api/login {phone, password}   │  reads ADMIN_PASSWORD + ADMIN_PHONES
  ├─────────────────────────────────────▶│  validates, sets httpOnly session cookie
  │◀─── 200 + Set-Cookie: session ───────┤  (24-hour expiry)
  │                                      │
  │  GET /admin (React route)            │
  ├─ component mounts ─▶ GET /api/me ───▶│  verifies cookie, returns {phone}
  │◀─── 200 {phone} ─────────────────────┤  or 401
  │                                      │
  │  POST /api/logout                    │
  ├─────────────────────────────────────▶│  clears cookie
  │                                      │
```

### Why httpOnly cookie (and not localStorage)

- `iron-session` makes it ~5 lines per route — not harder than rolling our own
  signed token in localStorage
- httpOnly cookie is XSS-resistant; localStorage is not
- 24-hour expiry is a single `maxAge: 60*60*24` config option
- No EU cookie banner needed: this is a strictly necessary security cookie,
  exempt from consent requirements

## Env vars (set in Vercel dashboard, not in repo)

| Name             | Example                                 | Purpose                                    |
|------------------|-----------------------------------------|--------------------------------------------|
| `ADMIN_PASSWORD` | `<chosen by client>`                    | Single shared password                     |
| `ADMIN_PHONES`   | `+919113805407,+918105358074`           | Comma-separated list of allowed phones     |
| `SESSION_SECRET` | `<32+ char random string>`              | iron-session encryption key                |

For local dev, the same vars go in a gitignored `.env.local` file (`.env*.local`
already in `.gitignore`).

## File layout

```
api/
  login.ts         # POST: {phone, password} → set cookie or 401
  logout.ts        # POST: clear cookie
  me.ts            # GET: return {phone} from cookie or 401
  _lib/
    session.ts     # iron-session config, getSession() helper
    phone.ts       # normalizePhone(input: string) → "+919113805407" | null

src/
  pages/
    Admin.tsx           # protected route — mounts dashboard or redirects
    AdminLogin.tsx      # login form
    AdminDashboard.tsx  # placeholder shell ("Welcome, +91 ...")
  hooks/
    useAdminAuth.ts     # calls /api/me, returns {phone, loading, logout}

vercel.json             # only if needed to configure function runtime
package.json            # adds: iron-session, @vercel/node (dev), vercel (dev)
```

The `App.tsx` router gets two new routes: `/admin/login` (public) and `/admin`
(guarded — redirects to `/admin/login` if `useAdminAuth` returns 401).

## Phone normalization

Client types the number however they want. Server normalizes before comparison:

1. Strip everything that is not a digit
2. If exactly 10 digits and starts with `9`, `8`, `7`, `6`, prepend `91`
3. If 12 digits and starts with `91`, leave it
4. Else: invalid → 401
5. Compare `"+" + normalized` against `ADMIN_PHONES` list

Examples that should all map to `+919113805407`:
- `9113805407`
- `+91 91138 05407`
- `91-9113805407`
- `+919113805407`

Landline-style inputs (`08041723420`) fail by design.

## Login flow (frontend)

1. User visits `/admin` → `useAdminAuth` calls `/api/me` → 401 → redirect to `/admin/login`
2. User enters phone + password → form POSTs to `/api/login`
3. On 200: redirect to `/admin` → `useAdminAuth` re-checks → renders dashboard
4. On 401: show inline error "Invalid phone or password." (don't reveal which)

## Session & expiry

- Cookie name: `sm_admin_session`
- `httpOnly: true`, `secure: true` (in production), `sameSite: 'strict'`, `path: '/'`
- `maxAge: 60 * 60 * 24` (24 hours from issue)
- Sliding expiry: **no** — fixed 24h from login, then re-login. Simpler.
- Cookie payload (encrypted by iron-session): `{ phone: "+919113805407", iat: <epoch> }`

## Logout

- `AdminDashboard` has a "Log out" button that POSTs to `/api/logout`
- `/api/logout` calls `session.destroy()` → cookie cleared
- Frontend redirects to `/admin/login`

## Local development

`npm start` (CRA dev server) does not serve `/api/*` routes. Two options:

- **Recommended:** use `vercel dev` instead — runs CRA + serverless functions
  on a single port (default 3000). One command, mirrors production.
- **Alternative:** keep using `npm start` for visual work; spin up `vercel dev`
  only when testing auth.

I'll add an npm script: `"dev": "vercel dev"` so `npm run dev` Just Works.

## Deployment notes

- First push of this branch: open a Vercel preview, set the three env vars on
  the Vercel project (Preview scope), test login.
- When merging to master: ensure the same env vars exist in Production scope.
- Document this in a short `docs/admin-deploy.md` so future-you doesn't forget.

## Security considerations

- Rate limiting: out of scope for v1. Two valid phones, decent password —
  brute force risk is low. Add later via Vercel Edge Middleware if it
  becomes a concern.
- Password storage: env var as plaintext is acceptable for one-tenant,
  one-credential setup. Hashing buys nothing here (no DB, no leak surface
  beyond the env itself).
- HTTPS: Vercel terminates TLS, cookie is `secure` flag — fine.
- CSRF: `sameSite: 'strict'` cookie + same-origin API routes covers it. No
  extra token needed.

## Test plan

Manual, since CRA's test setup is bare. After implementation:

1. `vercel dev`, visit `/admin` → redirected to `/admin/login`
2. Submit empty form → inline error
3. Submit wrong password → 401, generic error
4. Submit landline → 401
5. Submit `9113805407` (no +91) → succeeds
6. Submit `+91 91138 05407` (with spaces) → succeeds
7. After login, refresh `/admin` → still logged in (cookie persists)
8. Click logout → redirected to login, refresh `/admin` → 401 again
9. Wait 24h (or manually expire cookie in DevTools) → next request 401s

## Future hooks (not built now, but design accommodates)

- Same `getSession()` helper protects future `/api/save-events` and
  `/api/upload-photo` endpoints — just `const session = await getSession(req); if (!session) return 401`
- Adding a third admin phone = edit `ADMIN_PHONES` env var, redeploy. No code change.
