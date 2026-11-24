# DO DIGITALS — Full-Stack Digital Agency Website

**WHERE BRANDS TAKE FLIGHT!**

A complete, production-ready full-stack website for the DO DIGITALS digital agency:
premium multi-page public site + secure admin dashboard (CMS) + persistent database,
all fully responsive with dark/light themes and deep WhatsApp integration.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons |
| Animation | Framer Motion (reduced-motion aware) |
| Server state | TanStack Query v5 |
| Database | SQLite via Prisma ORM (`db/custom.db`) |
| Auth | Custom JWT sessions (jose) + bcrypt hashing, httpOnly cookies |
| Validation | Server-side (per-route) + client-side, honeypot + rate limiting |
| Theme | next-themes (class strategy, system-default aware) |
| Toasts | Sonner |

The whole application (public pages **and** admin CMS) is served under the single
route `/` using hash routing (`#/about`, `#/portfolio`, `#/admin`, ...). This makes
deployment trivial on any static-capable Node host while keeping a real database,
real APIs, and real persistence.

## 2. Features

### Public website
- **Home** — hero, about preview, 4 service cards, why-choose grid, featured
  portfolio with category filters, working process (Discover→Plan→Create→Launch→Grow),
  database-driven testimonials, animated statistics, WhatsApp CTA, full footer.
  Every section can be toggled on/off from the admin Homepage editor.
- **About** — story, mission, vision, core values, working approach, CTA.
- **Services** — index page + 4 fully-designed service detail pages (Graphic
  Designing, Digital Marketing, Web Development, Software Development) with
  features, rich-text descriptions, related projects, FAQs, service-specific
  WhatsApp pre-filled messages.
- **Portfolio** — database-driven gallery with category filters, search,
  featured flag, detail pages with image gallery + related projects.
- **Contact** — validated form (name, email, phone, service, budget, message)
  saved to DB with spam honeypot + rate limiting; WhatsApp/email/social cards.
- **Blog** — database-driven with categories, search, detail pages, share buttons.
- **Legal** — editable Privacy Policy and Terms & Conditions.
- **404** — branded page-not-found experience.
- **Dark/Light mode** — toggle in navbar, saved per user, correct logo variant
  per theme, system preference respected on first visit.
- **WhatsApp everywhere** — floating button + every service/CTA uses
  `https://wa.me/923153560805` with service-specific pre-filled messages.
  Number and messages are admin-editable.

### Admin dashboard (`#/admin`)
Secure login (JWT + bcrypt). Default credentials: **admin / DoDigitals@2025**
(change immediately from the Account page; override the seed password with the
`ADMIN_PASSWORD` env variable before first run).

Modules:
| Module | Capability |
|---|---|
| Dashboard | Real counts, recent inquiries, recent activity log |
| Homepage | Full homepage JSON editor + section visibility switches |
| About Page | Story/mission/vision/values editor |
| Navigation | Menu label/link/order/visibility CRUD |
| Footer | Description, links, contact info, copyright |
| SEO | Per-page titles, descriptions, keywords, OpenGraph, share image |
| Services | Full CRUD incl. features, FAQs, WhatsApp messages, ordering, publish |
| Portfolio | Projects CRUD (multi-image, technologies, featured, demo flag) + categories |
| Testimonials | CRUD with publish + demo flag (never present demo as real) |
| Statistics | Editable figures + visibility (demo values clearly noted) |
| Inquiries | Inbox with search, filters, status workflow, WhatsApp reply, delete |
| Media | Upload (drag-drop, 5MB, PNG/JPG/WEBP/GIF/SVG), library, alt text, copy URL |
| Blog | Posts CRUD (drafts, publish, SEO fields, categories) + category management |
| Site Settings | Name, logos (light/dark), favicon, brand colors (live re-theme), contact info, WhatsApp, theme default, maintenance mode, global CTA |
| Social Links | Platform URL CRUD with visibility |
| Account | Profile, change password, session info, logout |

## 3. Project Structure

```
src/
  app/
    page.tsx              → single-route entry (renders the hash router)
    layout.tsx            → SSR settings/brand/SEO injection
    globals.css           → Tailwind 4 theme tokens (brand green wired in)
    api/                  → backend (public + admin REST endpoints)
  components/
    app-router.tsx        → hash-based router (public pages + admin)
    site/                 → navbar, footer, cards, reveal animations, shared
    pages/                → home, about, services, portfolio, contact, blog...
    admin/                → login, shell, CRUD primitives, 17 modules
  hooks/                  → use-hash-route, use-site-data
  lib/
    db.ts                 → Prisma client
    auth.ts               → JWT + bcrypt session helpers
    seed.ts               → idempotent first-run seeding
    defaults.ts           → default/demo content (single source of truth)
    content.ts            → server-side content access with fallbacks
    rate-limit.ts         → in-memory sliding-window limiter
    brand.ts              → hex→HSL brand theming (SSR + live)
    api.ts                → ok/bad/adminGuard/logActivity helpers
    whatsapp.ts           → wa.me link builder + formatting
prisma/schema.prisma      → all models
db/custom.db              → SQLite database file (persistent)
public/brand/             → brand imagery (logos, hero, services, portfolio…)
scripts/                  → gen-assets, reset-content helpers
```

## 4. Getting Started

```bash
# 1. Install dependencies
bun install        # or npm install / pnpm install

# 2. Configure environment (see .env.example)
cp .env.example .env

# 3. Push the database schema
bun run db:push

# 4. Start the dev server
bun run dev        # → http://localhost:3000
```

On first request the database is **seeded automatically** (admin account,
default content, four services with FAQs, clearly-marked demo portfolio
projects/testimonials/blog posts, navigation, media library entries).
Seeding is idempotent — it never overwrites content you edited.

- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/#/admin
- **Default login:** admin / DoDigitals@2025

## 5. Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | SQLite file path | `file:/home/z/my-project/db/custom.db` (see `.env`) |
| `AUTH_SECRET` | JWT signing secret — **set a long random value in production** | dev fallback (warned) |
| `ADMIN_USERNAME` | Seeded admin username | `admin` |
| `ADMIN_PASSWORD` | Seeded admin password (first run only) | `DoDigitals@2025` |

No secrets are ever exposed to the frontend; all privileged logic runs in
API route handlers protected by the session cookie + same-origin checks.

## 6. Production Deployment

1. **Build & run**
   ```bash
   bun run build
   bun run start       # serves the standalone Next.js server
   ```
2. **Database** — SQLite ships in `db/custom.db`; for hosted/multi-instance
   deployments use **Turso (libSQL)**: set `TURSO_DATABASE_URL` +
   `TURSO_AUTH_TOKEN` and run `bun run turso:push` (see README-DEPLOY.md).
   No schema or provider changes are needed.
3. **Migrations** — the schema is applied with `prisma db push`. To generate
   migration files for CI/CD: `bun run db:migrate` (Prisma migrate dev).
4. **Media storage** — uploads are stored as bytes inside the database and
   served via `/api/media/[id]/raw`, so they survive restarts without any
   external bucket. To use S3/R2 instead, change the upload handler in
   `src/app/api/admin/media/route.ts` and store external URLs in the
   `MediaAsset.url` column (the admin library already supports URL entries).
5. **Auth hardening** — set `AUTH_SECRET` to a 64+ char random string and
   change the admin password immediately. Sessions are httpOnly JWT cookies
   valid for 7 days.
6. **SEO** — robots.txt and sitemap.xml are in `public/`. Replace
   `https://your-domain.com` inside `public/sitemap.xml` with your real
   domain. Per-page meta is managed in **Admin → SEO**.

### Database backup

```bash
cp db/custom.db backups/custom-$(date +%F).db      # simple file backup
# or with the SQLite CLI:
sqlite3 db/custom.db ".backup backups/custom.db"
```

Schedule daily backups (cron) and keep them off-machine.

### Error handling & logging

- API routes return typed JSON errors (`{ "error": "message" }`) with proper
  status codes; safe messages never leak internals.
- Admin mutations are recorded in the `ActivityLog` table (visible on the
  dashboard).
- Server logs stream to `dev.log` (`bun run dev`) or `server.log`
  (`bun run start`).

## 7. Security Notes

- Passwords hashed with bcrypt (10 rounds).
- Sessions: signed JWT (HS256) in httpOnly, sameSite=lax cookies
  (+ secure flag in production), 7-day expiry.
- All admin endpoints verify the session server-side; mutations additionally
  verify the request Origin (CSRF mitigation).
- Login and password-change endpoints are rate-limited (8 attempts / 15 min
  per IP); contact form is limited to 5 submissions / 30 min per IP.
- Upload validation: MIME allow-list + 5 MB cap.
- Honeypot field silently drops bot submissions.
- Protected admin routes cannot render without a valid session.

## 8. Content Honesty (demo data policy)

All seeded portfolio projects, testimonials, and blog posts are flagged
`isDemo: true` and visibly labeled **“Demo Content”** on the site. Statistics
show a note indicating sample figures. Nothing fabricated is ever presented as
a genuine client review or business achievement — replace demo rows with real
data from the dashboard before launch (or simply delete them).

## 9. Useful Scripts

| Command | Description |
|---|---|
| `bun run dev` | Development server (port 3000) |
| `bun run build` / `bun run start` | Production build / serve |
| `bun run lint` | ESLint |
| `bun run db:push` | Apply schema to database |
| `bun scripts/reset-content.ts` | Reset content blobs to defaults (optional keys) |
| `bun scripts/gen-assets.ts` | Regenerate placeholder brand imagery |

---

**DO DIGITALS — WHERE BRANDS TAKE FLIGHT!**
WhatsApp: +92 315 3560805 · dodigitals313@gmail.com
