# Admin Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected `/admin` route on the existing CRA site with Vercel serverless functions handling login/session, so the school can later edit content without touching code.

**Architecture:** CRA frontend + 3 Vercel API routes (`/api/login`, `/api/logout`, `/api/me`). 24-hour httpOnly cookie sessions via `iron-session`. Two allowed phones + one shared password, all from env vars.

**Tech Stack:** React 19, TypeScript, react-router-dom v7, Vercel serverless functions, iron-session v8, Jest (CRA default).

---

## File Structure

```
api/
  login.ts             # POST: validate creds, set session
  logout.ts            # POST: destroy session
  me.ts                # GET: return {phone} or 401

src/
  lib/
    phone.ts           # normalizePhone(): "+91 91138 05407" -> "+919113805407"
    session.ts         # iron-session config + getSession() helper
    __tests__/
      phone.test.ts    # unit tests for normalizePhone
  hooks/
    useAdminAuth.ts    # React hook: calls /api/me, exposes auth state
  pages/
    AdminLogin.tsx     # login form
    AdminDashboard.tsx # placeholder shell with logout button
    Admin.tsx          # guard: shows Dashboard or redirects to login
  layouts/
    PublicLayout.tsx   # Navbar + <Outlet/> + Footer + MapFab (existing chrome)
    AdminLayout.tsx    # minimal: just <Outlet/>

tsconfig.json          # extend "include" to cover api/
package.json           # add iron-session; add `dev: vercel dev` script
.env.local.example     # template (no real secrets)
docs/admin-deploy.md   # how to set Vercel env vars
```

Decisions worth knowing:
- **`src/lib/` not `api/_lib/`** so CRA's Jest finds `phone.test.ts` natively. `api/*.ts` imports from `../src/lib/`. Vercel handles cross-directory imports fine.
- **Inline styles in admin pages** (not CSS classes in `App.css`). Admin is internal, scoped styling keeps it self-contained and easy to remove.
- **Layout split (PublicLayout / AdminLayout)** instead of conditional Navbar render. Cleaner with react-router v6, no `useLocation` checks.

---

### Task 1: Install dependencies and update config

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `.env.local.example`

- [ ] **Step 1: Install runtime dependency**

Run: `npm install iron-session`
Expected: `package.json` shows `"iron-session": "^8.x.x"` under dependencies.

- [ ] **Step 2: Install dev dependencies**

Run: `npm install -D vercel @vercel/node`
Expected: `package.json` has both under devDependencies.

- [ ] **Step 3: Add `dev` script**

Edit `package.json` "scripts" section. Add a line after `"start"`:

```json
"scripts": {
  "start": "react-scripts start",
  "dev": "vercel dev",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

- [ ] **Step 4: Update `tsconfig.json` to include `api/`**

Change the `include` array from:
```json
"include": [
  "src"
]
```
to:
```json
"include": [
  "src",
  "api"
]
```

- [ ] **Step 5: Create `.env.local.example`**

Create `/.env.local.example` with this exact content:
```
# Copy to .env.local for local dev. Real values live in Vercel dashboard.
ADMIN_PASSWORD=change-me-locally
ADMIN_PHONES=+919113805407,+918105358074
SESSION_SECRET=local-dev-secret-must-be-32-chars-or-longer-xxxxx
```

- [ ] **Step 6: Verify `.env.local` is already gitignored**

Run: `grep -n "env.local" .gitignore`
Expected: prints lines like `.env.local`, `.env.development.local`, etc. (CRA default).

- [ ] **Step 7: Verify CRA still builds**

Run: `npm run build`
Expected: builds successfully. (No TS errors from including the empty `api/` dir.)

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json .env.local.example
git commit -m "chore: add iron-session, vercel dev tooling, env template"
```

---

### Task 2: Phone normalization (TDD)

**Files:**
- Create: `src/lib/phone.ts`
- Create: `src/lib/__tests__/phone.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/phone.test.ts`:
```ts
import { normalizePhone } from '../phone';

describe('normalizePhone', () => {
  test('returns null for empty string', () => {
    expect(normalizePhone('')).toBeNull();
  });

  test('accepts 10-digit Indian mobile', () => {
    expect(normalizePhone('9113805407')).toBe('+919113805407');
  });

  test('accepts +91 prefix', () => {
    expect(normalizePhone('+919113805407')).toBe('+919113805407');
  });

  test('accepts spaces and dashes', () => {
    expect(normalizePhone('+91 91138 05407')).toBe('+919113805407');
    expect(normalizePhone('91-9113805407')).toBe('+919113805407');
  });

  test('accepts 91 prefix without +', () => {
    expect(normalizePhone('919113805407')).toBe('+919113805407');
  });

  test('11-digit landline-style input (leading 0) is rejected by length', () => {
    // Common Indian landline format with STD code: 080-4172-3420
    expect(normalizePhone('08041723420')).toBeNull();
  });

  test('10-digit landline-like input normalizes (allowlist filters it later)', () => {
    // We cannot tell mobile vs landline without an external lookup.
    // Allowlist (ADMIN_PHONES) is the real gate.
    expect(normalizePhone('8041723420')).toBe('+918041723420');
  });

  test('rejects too short', () => {
    expect(normalizePhone('911380')).toBeNull();
  });

  test('rejects too long', () => {
    expect(normalizePhone('9112345678901234')).toBeNull();
  });

  test('rejects letters / non-digits only', () => {
    expect(normalizePhone('hello')).toBeNull();
    expect(normalizePhone('---')).toBeNull();
  });

  test('rejects 10-digit number starting with 0-5', () => {
    expect(normalizePhone('5113805407')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --watchAll=false src/lib/__tests__/phone.test.ts`
Expected: All tests fail with `Cannot find module '../phone' from 'src/lib/__tests__/phone.test.ts'`.

- [ ] **Step 3: Implement normalizePhone**

Create `src/lib/phone.ts`:
```ts
export function normalizePhone(input: string): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return '+91' + digits;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --watchAll=false src/lib/__tests__/phone.test.ts`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/phone.ts src/lib/__tests__/phone.test.ts
git commit -m "feat: phone normalization for admin login"
```

---

### Task 3: Session configuration

**Files:**
- Create: `src/lib/session.ts`

- [ ] **Step 1: Implement session config**

Create `src/lib/session.ts`:
```ts
import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type SessionData = {
  phone?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || '',
  cookieName: 'sm_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  },
};

export async function getSession(
  req: VercelRequest,
  res: VercelResponse
): Promise<IronSession<SessionData>> {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      'SESSION_SECRET env var is missing or shorter than 32 characters.'
    );
  }
  return getIronSession<SessionData>(req, res, sessionOptions);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: iron-session config for 24h httpOnly admin sessions"
```

---

### Task 4: /api/login endpoint

**Files:**
- Create: `api/login.ts`

- [ ] **Step 1: Create the login handler**

Create `api/login.ts`:
```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';
import { normalizePhone } from '../src/lib/phone';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, password } = (req.body ?? {}) as {
    phone?: unknown;
    password?: unknown;
  };

  if (typeof phone !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing phone or password' });
  }

  const normalized = normalizePhone(phone);
  const allowed = (process.env.ADMIN_PHONES ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const phoneOk = normalized !== null && allowed.includes(normalized);
  const passwordOk = password === (process.env.ADMIN_PASSWORD ?? '');

  if (!phoneOk || !passwordOk) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const session = await getSession(req, res);
  session.phone = normalized!;
  await session.save();

  return res.status(200).json({ phone: normalized });
}
```

- [ ] **Step 2: Copy `.env.local.example` to `.env.local`**

Run: `cp .env.local.example .env.local`
This is needed so `vercel dev` picks up the env vars locally. Do NOT commit `.env.local`.

- [ ] **Step 3: Run dev server**

Run: `npm run dev`
Expected: `vercel dev` starts on `http://localhost:3000`. On the very first run, the CLI may prompt to log in or link the project. If asked to "Set up and develop?", answer **N**. Local dev works without linking.

If you see a login prompt that blocks the terminal, run `vercel logout` first, then retry — vercel dev does not strictly require a logged-in account for local-only API serving.

Leave this terminal running for the next steps.

- [ ] **Step 4: Test login with valid credentials**

In a second terminal:
```bash
curl -i -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9113805407","password":"change-me-locally"}'
```
Expected: HTTP 200, body `{"phone":"+919113805407"}`, response includes a `Set-Cookie: sm_admin_session=...` header.

- [ ] **Step 5: Test login with invalid password**

```bash
curl -i -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9113805407","password":"wrong"}'
```
Expected: HTTP 401, body `{"error":"Invalid phone or password"}`, no Set-Cookie.

- [ ] **Step 6: Test login with landline (11 digits)**

```bash
curl -i -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"08041723420","password":"change-me-locally"}'
```
Expected: HTTP 401.

- [ ] **Step 7: Test login with non-allowlisted mobile**

```bash
curl -i -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"change-me-locally"}'
```
Expected: HTTP 401 (normalizes successfully but allowlist rejects).

- [ ] **Step 8: Commit**

```bash
git add api/login.ts
git commit -m "feat: /api/login endpoint with phone+password validation"
```

---

### Task 5: /api/me endpoint

**Files:**
- Create: `api/me.ts`

- [ ] **Step 1: Create the me handler**

Create `api/me.ts`:
```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.status(200).json({ phone: session.phone });
}
```

- [ ] **Step 2: Test unauthenticated /api/me**

(With `npm run dev` still running.) Fresh request, no cookie:
```bash
curl -i http://localhost:3000/api/me
```
Expected: HTTP 401, body `{"error":"Not authenticated"}`.

- [ ] **Step 3: Test authenticated /api/me**

```bash
curl -c /tmp/sm.cookies -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9113805407","password":"change-me-locally"}' \
  && curl -b /tmp/sm.cookies http://localhost:3000/api/me
```
Expected: First call returns the login JSON. Second call returns `{"phone":"+919113805407"}`.

- [ ] **Step 4: Commit**

```bash
git add api/me.ts
git commit -m "feat: /api/me endpoint to verify session"
```

---

### Task 6: /api/logout endpoint

**Files:**
- Create: `api/logout.ts`

- [ ] **Step 1: Create the logout handler**

Create `api/logout.ts`:
```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  session.destroy();

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Test logout**

Re-using `/tmp/sm.cookies` from Task 5:
```bash
curl -b /tmp/sm.cookies -c /tmp/sm.cookies -X POST http://localhost:3000/api/logout \
  && echo \
  && curl -b /tmp/sm.cookies http://localhost:3000/api/me
```
Expected: First call returns `{"ok":true}` and a Set-Cookie clearing `sm_admin_session`. Second call returns 401.

- [ ] **Step 3: Commit**

```bash
git add api/logout.ts
git commit -m "feat: /api/logout endpoint"
```

---

### Task 7: useAdminAuth hook

**Files:**
- Create: `src/hooks/useAdminAuth.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useAdminAuth.ts`:
```ts
import { useEffect, useState, useCallback } from 'react';

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; phone: string }
  | { status: 'unauthenticated' };

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = (await res.json()) as { phone: string };
        setState({ status: 'authenticated', phone: data.phone });
      } else {
        setState({ status: 'unauthenticated' });
      }
    } catch {
      setState({ status: 'unauthenticated' });
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    setState({ status: 'unauthenticated' });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh, logout };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAdminAuth.ts
git commit -m "feat: useAdminAuth hook for client-side auth state"
```

---

### Task 8: AdminLogin page

**Files:**
- Create: `src/pages/AdminLogin.tsx`

- [ ] **Step 1: Create the login page**

Create `src/pages/AdminLogin.tsx`:
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ phone, password }),
      });
      if (res.ok) {
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid phone or password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={styles.title}>Sanskaar Admin</h1>
        <label style={styles.label}>
          Mobile number
          <input
            type="tel"
            inputMode="tel"
            autoComplete="username"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+91 91138 05407"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </label>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: '2rem',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: { margin: 0, marginBottom: '0.5rem', textAlign: 'center' },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 14,
    color: '#444',
    gap: 6,
  },
  input: {
    padding: '10px 12px',
    fontSize: 16,
    border: '1px solid #ccc',
    borderRadius: 8,
    outline: 'none',
  },
  error: { color: '#b00020', fontSize: 14 },
  button: {
    padding: '12px',
    fontSize: 16,
    border: 'none',
    borderRadius: 8,
    background: '#3a6a3a',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default AdminLogin;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminLogin.tsx
git commit -m "feat: admin login page with phone + password form"
```

---

### Task 9: AdminDashboard placeholder + Admin guard

**Files:**
- Create: `src/pages/AdminDashboard.tsx`
- Create: `src/pages/Admin.tsx`

- [ ] **Step 1: Create the dashboard placeholder**

Create `src/pages/AdminDashboard.tsx`:
```tsx
import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC<{ phone: string }> = ({ phone }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Sanskaar Admin</h1>
        <div style={styles.userBlock}>
          <span style={styles.phone}>{phone}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <p>You're signed in. Content management features coming soon.</p>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 960, margin: '2rem auto', padding: '0 1rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e6e6e6',
    marginBottom: '2rem',
  },
  title: { margin: 0 },
  userBlock: { display: 'flex', alignItems: 'center', gap: '1rem' },
  phone: { fontSize: 14, color: '#666' },
  logoutBtn: {
    padding: '8px 14px',
    fontSize: 14,
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  },
  main: { lineHeight: 1.6 },
};

export default AdminDashboard;
```

- [ ] **Step 2: Create the Admin guard**

Create `src/pages/Admin.tsx`:
```tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminDashboard from './AdminDashboard';

const Admin: React.FC = () => {
  const { state } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'unauthenticated') {
      navigate('/admin/login', { replace: true });
    }
  }, [state, navigate]);

  if (state.status === 'loading') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>
    );
  }
  if (state.status === 'unauthenticated') {
    return null; // redirect in useEffect
  }
  return <AdminDashboard phone={state.phone} />;
};

export default Admin;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboard.tsx src/pages/Admin.tsx
git commit -m "feat: admin dashboard placeholder and route guard"
```

---

### Task 10: Wire routes in App.tsx with public/admin layout split

**Files:**
- Create: `src/layouts/PublicLayout.tsx`
- Create: `src/layouts/AdminLayout.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create PublicLayout**

Create `src/layouts/PublicLayout.tsx`:
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MapFab from '../components/MapFab';

const PublicLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <MapFab />
    </>
  );
};

export default PublicLayout;
```

- [ ] **Step 2: Create AdminLayout**

Create `src/layouts/AdminLayout.tsx`:
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f5' }}>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
```

- [ ] **Step 3: Replace App.tsx**

Replace the entire content of `src/App.tsx` with:
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Founders from './pages/Founders';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Build for production to ensure no regressions**

Run: `npm run build`
Expected: Build succeeds with no new warnings.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/layouts/PublicLayout.tsx src/layouts/AdminLayout.tsx
git commit -m "feat: split routes into public + admin layouts"
```

---

### Task 11: End-to-end smoke test + deployment doc

**Files:**
- Create: `docs/admin-deploy.md`

- [ ] **Step 1: Create `docs/admin-deploy.md`**

Create with this content:
```markdown
# Admin Auth — Deployment Notes

## Required env vars (set in Vercel dashboard)

In **Vercel project → Settings → Environment Variables**, add three vars to
both Preview and Production scopes:

| Name             | Example                                    | Notes                                       |
|------------------|--------------------------------------------|---------------------------------------------|
| `ADMIN_PASSWORD` | (chosen by client)                         | Single shared password for both phones      |
| `ADMIN_PHONES`   | `+919113805407,+918105358074`              | Comma-separated, normalized E.164 format    |
| `SESSION_SECRET` | generate with `openssl rand -hex 32`       | At least 32 chars; do not reuse across envs |

After saving, redeploy the project for the new vars to take effect.

## Local dev

1. Copy `.env.local.example` to `.env.local` and fill in real values.
2. Run `npm run dev` (which runs `vercel dev`) — serves CRA + API routes on
   a single port (default 3000).
3. Visit `http://localhost:3000/admin` — should redirect to `/admin/login`.

## Resetting the password

Change `ADMIN_PASSWORD` in Vercel dashboard → redeploy. Existing sessions
remain valid until their 24-hour expiry; if you need to force logout
immediately, also rotate `SESSION_SECRET` (this invalidates all cookies).

## Adding a third admin phone

Edit `ADMIN_PHONES` env var, append the new normalized number with a comma
separator, redeploy. No code change.
```

- [ ] **Step 2: Run end-to-end smoke test in a browser**

With `npm run dev` running, walk through this checklist in a real browser:

1. Visit `http://localhost:3000/admin` → expect redirect to `/admin/login`.
2. Submit empty form → expect browser-native required-field validation prevents submit.
3. Submit `9999999999` + correct password → expect "Invalid phone or password." inline error.
4. Submit `9113805407` + wrong password → expect same error.
5. Submit `08041723420` (landline) + correct password → expect same error.
6. Submit `9113805407` + correct password → expect navigation to `/admin`, dashboard shows the phone in header.
7. Refresh `/admin` → expect still signed in.
8. Click "Log out" → expect redirect to `/admin/login`. Visiting `/admin` again redirects to login.
9. Submit `+91 91138 05407` (with spaces) + correct password → expect successful login.
10. Visit `/`, `/about`, `/gallery`, `/events` → expect existing pages still work, Navbar/Footer/MapFab still visible.
11. Visit `/admin/login` directly → expect login form with NO Navbar/Footer/MapFab.
12. In DevTools → Application → Cookies → delete `sm_admin_session`, refresh `/admin` → expect redirect to login.

If any step fails, debug before continuing.

- [ ] **Step 3: Commit**

```bash
git add docs/admin-deploy.md
git commit -m "docs: admin auth deployment and operational notes"
```

- [ ] **Step 4: Final review**

Run: `git log --oneline master..HEAD`
Expected: ~10 feature/chore/docs commits since the spec commit, in clean order.

Run: `npm run build`
Expected: Build succeeds.

Run: `npm test -- --watchAll=false`
Expected: phone normalization tests pass; CRA's default `App.test.tsx` may need a small tweak if it broke due to routing changes (if so: skip or update that one test as a follow-up step inside this task).

---

## Out of scope (verify NOT in this branch)

- Editing site content from `/admin` → next branch
- Cloudinary photo upload → branch after that
- Rate limiting / brute-force protection → tracked, deferred
- Password hashing → unnecessary for env-var-only credential
- Sliding session expiry → fixed 24h is intentional
