# Sanskaar Montessori

> Rooted in Values, Growing with Joy — the official website for Sanskaar Montessori, a Montessori preschool in Bengaluru.

**Live site: [www.sanskaarmontessori.in](https://www.sanskaarmontessori.in)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

![Sanskaar Montessori](public/banner.jpg)

## What it is

A React + TypeScript single-page website for a Montessori preschool, built as a freelance project. Alongside the public-facing site (home, about, founders, gallery, events), it includes a password-protected admin panel that lets the school staff manage photos, events, and site content themselves — no developer needed for day-to-day updates. The frontend runs as a static SPA; the backend is a set of Vercel serverless functions.

## Features

- **Public site** — Home, About, Founders, Gallery, and Events pages with a shared layout, navbar, footer, and a floating map button
- **Photo gallery** — categorised image galleries served via Cloudinary with skeleton loading states
- **Events** — upcoming and past events rendered from structured JSON content
- **Admin panel** (`/admin`) — phone + password login, dashboard, and editors for:
  - Gallery images: upload (signed Cloudinary uploads), reorder, recategorise, delete
  - Gallery categories
  - Events and upcoming-event highlights
  - Image slots and site settings
- **Git-backed CMS** — admin saves commit content JSON directly back to this repo via the GitHub API, so every content change is versioned and triggers a redeploy
- **Secure sessions** — `iron-session` cookies (httpOnly, sameSite=strict, 24 h TTL) with constant-time password comparison on login
- **SEO basics** — sitemap, robots.txt, and web-vitals reporting

## Tech stack

- **Frontend:** React 19, TypeScript, React Router 7, Lucide icons, Create React App (react-scripts)
- **Backend:** Vercel serverless functions (`@vercel/node`)
- **Auth:** iron-session
- **Media:** Cloudinary (storage, transformation, signed uploads)
- **Content storage:** JSON files in-repo, written via the GitHub Contents API
- **Hosting:** Vercel

## Getting started

Requires Node 22 (see `.nvmrc`).

```bash
npm install

# Frontend only (public pages)
npm start

# Full stack including the /api serverless functions
npm run vercel:dev

# Production build (validates required env vars first)
npm run build

# Tests
npm test
```

For the admin panel and API routes, copy `.env.local.example` to `.env.local` and fill in the admin credentials, session secret, GitHub token, and Cloudinary keys. See `docs/admin-deploy.md` for deployment notes.

## Project structure

```
api/            Vercel serverless functions (auth, content saves, image management)
src/pages/      Public pages + admin pages
src/components/ Shared UI components
src/content/    Site content (JSON + typed content modules)
src/lib/        Session, GitHub API, Cloudinary, helpers
scripts/        Env validation + Cloudinary migration script
```

---

Built by [Manu Rathan Setty](https://manurathansetty.github.io)
