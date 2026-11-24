# DO DIGITALS — Deployment Guide (Vercel + Turso)

Full-stack Next.js 16 site: public marketing website + admin CMS dashboard at `/#/admin`.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Prisma ORM · Turso (libSQL) · JWT auth (jose + bcryptjs)

---

## 0. What is included in this package

```
├── src/                  # All application code
│   ├── app/              # App Router pages + /api routes (auth, admin, public APIs)
│   ├── components/       # site/, pages/, admin/, ui/ (shadcn), premium.tsx (motion)
│   ├── hooks/            # SWR-based site data hooks
│   └── lib/              # auth, db, seed, rate-limit, api helpers, brand theming
├── prisma/schema.prisma  # Full database schema (all CMS models)
├── scripts/              # turso-push.ts (schema + data sync), asset & content scripts
├── public/               # Logos, OG image, favicon, robots.txt, sitemap.xml
├── db/custom.db          # SQLite snapshot of current site content (for local use)
├── package.json          # Scripts + dependencies (includes postinstall: prisma generate)
├── .env.example          # Documented environment template
├── next.config.ts · tsconfig.json · tailwind.config.ts · postcss.config.mjs
├── eslint.config.mjs · components.json · .gitignore · README.md
└── README-DEPLOY.md      # This guide
```

The app **self-seeds a fresh database on first request** (`src/lib/seed.ts`): admin account,
site content, services, portfolio categories + projects, testimonials, statistics, blog
categories + posts, navigation, social links and media placeholders. You never need to
import data manually — deploy, open the site once, then manage everything from the dashboard.

---

## 1. The database — Turso (libSQL)

The app is **SQLite-native** and uses **Turso** as its hosted database in production.
Turso is SQLite over the cloud — same engine, same schema, **no code or provider changes**.
`src/lib/db.ts` detects your Turso credentials automatically:

- `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` set → talks to Turso
- otherwise → uses the local SQLite file `db/custom.db`

> Why not plain SQLite in production? Vercel's serverless filesystem is read-only and
> ephemeral — anything written to a file is lost. Turso keeps your data persistent and
> shared across all serverless instances.

### 1.1 Create your Turso database (one time)

1. Sign up at **https://app.turso.tech** (free tier is enough).
2. **Create database** → pick a name (e.g. `dodigitals`) and a region close to your users.
3. Open the database → **Connect** — you need exactly two values:
   - **Database URL** — looks like `libsql://dodigitals-<your-org>.turso.io`
   - **Database token** — a long JWT starting with `eyJ…`
     (button **"Generate Token"** on the same screen, or CLI: `turso db tokens create dodigitals`)

### 1.2 Push the schema + your current content to Turso

With the two values filled into `.env` (locally):

```bash
bun run turso:push
```

The script (scripts/turso-push.ts):
1. generates the full schema SQL from `prisma/schema.prisma`
2. creates all 15 tables in Turso
3. copies every row from the local `db/custom.db` snapshot (admin account, services,
   portfolio, blog, testimonials, inquiries, media, settings…)
4. verifies the remote row counts

It is safe to re-run (idempotent). If you prefer to start fresh instead, skip this —
the app seeds a brand-new empty Turso database automatically on first visit.

### 1.3 Nothing else to change

`prisma/schema.prisma` stays `provider = "sqlite"`. The libSQL driver adapter
(`@prisma/adapter-libsql` + `@libsql/client`, already in `package.json`) does the rest.

---

## 2. Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Notes |
|---|---|---|
| `TURSO_DATABASE_URL` | **Yes** | From Turso → Connect. Looks like `libsql://dodigitals-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | **Yes** | Turso database token (JWT). Treat it like a password — never commit it |
| `AUTH_SECRET` | **Yes** | JWT signing secret for admin sessions. Generate: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Recommended | Password for the auto-created `admin` account on first seed. Default: `DoDigitals@2025` |
| `ADMIN_ALLOWED_ORIGINS` | Optional | Comma-separated origins, only if login ever returns "Invalid origin" behind a proxy |
| `APP_URL` | Optional | Canonical site URL (used by the origin allowlist) |

`DATABASE_URL` (the local `file:../db/custom.db` value) is only needed for local
development and is already documented in `.env.example` — you do **not** need to set it
on Vercel.

---

## 3. Deploy steps

### A. Via GitHub (recommended)

```bash
# in the unzipped project folder
git init && git add . && git commit -m "DO DIGITALS website"
git remote add origin https://github.com/<you>/dodigitals.git
git push -u origin main
```

1. Vercel → **Add New → Project → Import** your repo.
2. Framework preset: **Next.js** (auto-detected). Build command and output are picked up
   from `package.json` automatically (the `postinstall` hook runs `prisma generate`).
3. Add the environment variables from section 2 (`TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `AUTH_SECRET`).
4. **Deploy.** First build takes ~2 minutes.

### B. Via Vercel CLI

```bash
npm i -g vercel
vercel            # link the project
vercel --prod     # production deploy
```

### After the first deploy — checklist

1. Open `https://<your-app>.vercel.app` — the site connects to Turso and, if you skipped
   the data push, seeds itself on first view.
2. Go to `/#/admin` → log in with `admin` + your `ADMIN_PASSWORD` (default `DoDigitals@2025`).
3. **Account → Update password** immediately.
4. If you ran `turso:push`, your existing content is already live. Otherwise replace the
   seeded demo content (Services, Portfolio, Testimonials, Blog, Statistics) and upload
   your media.
5. Attach your custom domain in Vercel → Settings → Domains.

---

## 4. Local development (with the included SQLite snapshot)

```bash
npm install                  # or: bun install
npx prisma generate          # happens automatically via postinstall
npm run dev                  # http://localhost:3000
```

- Admin: `http://localhost:3000/#/admin` → `admin` / `DoDigitals@2025`
- Content reset (restore demo data): `npx tsx scripts/reset-content.ts`
- Leave `TURSO_*` variables empty to stay on SQLite; fill them in to develop against Turso.

---

## 5. Troubleshooting

| Symptom | Cause & fix |
|---|---|
| Build fails with Prisma error "did not initialize yet" | Ensure `postinstall: prisma generate` exists (it does in this package) and `prisma` is in `dependencies` |
| Login returns "Invalid origin" | Your proxy rewrites `Host`. Add your public URL to `ADMIN_ALLOWED_ORIGINS` (e.g. `https://yourdomain.com`). Validation is never disabled — this allowlists your domain. |
| "Too many login attempts" | Rate limiter: 8 attempts / 15 min per IP+username. Wait or redeploy (resets in-memory state). |
| 500 on any `/api/*` + log shows `TURSO_AUTH_TOKEN is set but TURSO_DATABASE_URL is missing` | One of the two Turso variables is missing — set **both**, then redeploy |
| Turso connection error `UNAUTHORIZED` / 401 | The database token is wrong or was regenerated — create a fresh token in the Turso dashboard |
| Turso connection error `DATABASE_DOES_NOT_EXIST` / DNS failure | The `libsql://` URL is misspelled — copy it again from Turso → Connect |
| Data missing after deploy | Run `bun run turso:push` locally with the Turso variables in `.env`, or let the first visit seed the site |
| Images fail to load from Media | Vercel's filesystem is read-only at runtime — the sandbox SQLite media flow stores files in DB rows, so uploads work, but large files are capped; use an external host/CDN for heavy assets |

---

## 6. Security model (kept intact — nothing disabled)

- Admin session: JWT (HS256) in an **httpOnly, SameSite=Lax, Secure** cookie, 7-day expiry
- Passwords: bcrypt (cost 10)
- CSRF: `Origin` checked against `X-Forwarded-Host`/`Host`, an explicit allowlist, and
  browser-provided `Sec-Fetch-Site` metadata; cross-site mutations rejected (403) and logged
- Login/contact rate limiting (in-memory sliding window per instance)
- All admin mutations require both a valid session **and** the origin check
- **Turso token safety:** it lives only in environment variables (Vercel) or your local
  `.env` (which is excluded from every download/archive). Never hard-code it.
