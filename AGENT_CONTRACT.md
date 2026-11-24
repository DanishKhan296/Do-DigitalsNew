# DO DIGITALS — Agent Development Contract

This document defines the architecture, API contracts, and conventions for the
DO DIGITALS full-stack agency website. Read it fully before writing code.

## 1. Architecture Overview

- **Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui (New York), Lucide icons, Framer Motion, TanStack Query v5, next-themes, Sonner toasts.**
- **Single visible route:** `/` (`src/app/page.tsx`). All pages are rendered via
  **hash routing** (`#/about`, `#/portfolio`, `#/admin/...`) through
  `src/components/app-router.tsx` using `useHashRoute()` from
  `src/hooks/use-hash-route.ts`.
- NEVER create new files under `src/app/` other than API route handlers.
- NEVER use `next/link` between site pages — use plain `<a href="#/path">`.
  Helper: `routeHref('/about')` returns `#/about`.
- Backend: Next.js API routes under `src/app/api/**` using Prisma (`src/lib/db.ts`,
  `import { db } from '@/lib/db'`) against SQLite.
- **IMPORTANT:** run `bun run lint` only for quick syntax sanity if needed; do NOT
  run `bun run dev`, `bun run build`, or modify shared files outside your targets.

## 2. Brand & Styling Rules

- Brand green `#159B35` is wired as the `--primary` CSS variable; lime `#70C51C`
  available as `text-brand-light` / `bg-brand-light`. Do NOT use blue/indigo.
- Dark mode via `next-themes` (class strategy) — design BOTH themes. Use
  semantic tokens (`bg-background`, `text-foreground`, `bg-card`, `bg-accent`,
  `text-muted-foreground`, `border`) — never raw white/black hex.
- Tailwind classes: rounded-2xl cards, p-6 content, gap-6 spacing. Max-height
  scrolling lists: `max-h-96 overflow-y-auto dd-scrollbar`.
- Fonts: system stack already configured; no font imports.
- Animations: use `Reveal`, `RevealGroup`, `RevealItem` from
  `src/components/site/reveal.tsx` (they honor reduced motion). Subtle only.
- Icons: use `Icon` from `src/components/icon.tsx` when the icon name is data
  (DB string), otherwise import from `lucide-react` directly.
- No emojis anywhere in UI or code.
- Forms: shadcn `Input`, `Textarea`, `Select`, `Switch`, `Label`, `Button`,
  `Dialog`, `AlertDialog`, `Sheet`, `Tabs`, `Table`, `Badge`, `Skeleton`.
- Toasts: `import { toast } from 'sonner'`.

## 3. WhatsApp Integration

`import { waLink } from '@/lib/whatsapp'` — builds `https://wa.me/<digits>?text=<encoded>`.
All WhatsApp CTAs: `target="_blank" rel="noopener noreferrer"`. The number comes
from `useSettings()` → `settings.whatsappNumber` (default `+923153560805`).
Services carry their own `whatsappMessage` for pre-filled chat.

## 4. Data Hooks (src/hooks/use-site-data.ts) — already implemented

`useSettings, useNavItems, useSocials, useFooterContent, useSeoContent,
useHomeContent, useAboutContent, useContent(key), useServices, useService(slug),
useCategories, useProjects({category,search,featured}), useProject(slug),
useTestimonials, useStats, useBlogPosts({category,search}), useBlogPost(slug)`.
Types exported: `Settings, ServiceItem, ProjectItem, CategoryItem,
TestimonialItem, StatItem, BlogPostItem, HomeContent, FooterContent, SeoContent`.
Use `fetchJson` export for custom admin calls.

## 5. API Contract

All responses are JSON. Errors: `{ "error": "message" }` with proper status
(400/401/403/404/429/500). Auth: JWT httpOnly cookie `dd_admin_session` set by
login; admin endpoints reject unauthenticated calls with 401.

### Public endpoints
| Endpoint | Returns |
|---|---|
| `GET /api/content/settings` | settings JSON (see defaults in `src/lib/defaults.ts`) |
| `GET /api/content/home` | home JSON (`HomeContent` type) |
| `GET /api/content/about` | about JSON |
| `GET /api/content/footer` | footer JSON (`FooterContent`) |
| `GET /api/content/seo` | SEO JSON (`SeoContent`) |
| `GET /api/content/contact_page` | contact page JSON |
| `GET /api/content/privacy` / `terms` | `{ heading, content }` |
| `GET /api/navigation` | visible nav items `[{id,label,href,order,visible}]` |
| `GET /api/socials` | visible socials `[{id,platform,url,icon,visible}]` |
| `GET /api/services` | published services `ServiceItem[]` (features parsed to string[]) |
| `GET /api/services/[slug]` | one published `ServiceItem` (404 if missing) |
| `GET /api/portfolio?category=&search=&featured=1` | published `ProjectItem[]` |
| `GET /api/portfolio/[slug]` | one published `ProjectItem` (404 if missing) |
| `GET /api/portfolio-categories` | `[{id,name,slug,order,projectCount}]` |
| `GET /api/testimonials` | published `TestimonialItem[]` |
| `GET /api/statistics` | visible `StatItem[]` |
| `GET /api/blog?category=&search=` | published `BlogPostItem[]` |
| `GET /api/blog/[slug]` | one published `BlogPostItem` (404 if missing) |
| `POST /api/inquiries` | body `{name,email,phone,service,budget,message,website?}` → `{success:true}`; 400 on validation error; 429 rate-limited |

### Admin endpoints (require session; otherwise 401)
| Endpoint | Methods | Notes |
|---|---|---|
| `POST /api/auth/login` | POST | `{username,password}` → `{user}`; sets cookie |
| `POST /api/auth/logout` | POST | clears cookie |
| `GET /api/auth/me` | GET | `{user}` or `{user:null}` |
| `PUT /api/auth/me` | PUT | `{name,email}` → `{user}` |
| `POST /api/auth/change-password` | POST | `{currentPassword,newPassword}` |
| `GET /api/admin/overview` | GET | `{stats:{totalProjects,publishedProjects,totalServices,totalInquiries,newInquiries,totalBlogPosts,publishedPosts,totalTestimonials,totalMedia},recentInquiries,recentActivity}` |
| `PUT /api/content/[key]` | PUT | admin save of any content blob |
| `/api/admin/services` | GET, POST | list includes unpublished; POST create |
| `/api/admin/services/[id]` | PUT, DELETE | full update incl. `faqs` array (replaces) |
| `/api/admin/portfolio` | GET, POST | |
| `/api/admin/portfolio/[id]` | PUT, DELETE | |
| `/api/admin/portfolio-categories` | GET, POST | |
| `/api/admin/portfolio-categories/[id]` | PUT, DELETE | |
| `/api/admin/testimonials` | GET, POST | |
| `/api/admin/testimonials/[id]` | PUT, DELETE | |
| `/api/admin/statistics` | GET, POST | |
| `/api/admin/statistics/[id]` | PUT, DELETE | |
| `/api/admin/inquiries?status=&search=` | GET | statuses: NEW, CONTACTED, IN_PROGRESS, COMPLETED |
| `/api/admin/inquiries/[id]` | GET, PUT `{status}`, DELETE | |
| `/api/admin/blog` | GET, POST | posts incl. drafts |
| `/api/admin/blog/[id]` | PUT, DELETE | `status: 'DRAFT'|'PUBLISHED'` |
| `/api/admin/blog-categories` | GET, POST | |
| `/api/admin/blog-categories/[id]` | PUT, DELETE | |
| `/api/admin/media` | GET, POST(multipart `file`,`alt`,`description`) | upload ≤5MB images; returns asset with `url` |
| `/api/admin/media/[id]` | PUT `{alt,description,filename}`, DELETE | |
| `GET /api/media/[id]/raw` | GET | public image bytes |
| `/api/admin/navigation` | GET, POST | |
| `/api/admin/navigation/[id]` | PUT, DELETE | |
| `/api/admin/socials` | GET, POST | |
| `/api/admin/socials/[id]` | PUT, DELETE | |

## 6. Admin auth client helpers (to be used by admin UI)

`src/lib/admin-client.ts` (implement if missing):
```ts
export async function adminFetch(url: string, options?: RequestInit): Promise<any>
// JSON fetch: sets Content-Type json, includes credentials (same-origin default),
// throws Error(server error message) on !res.ok. Parses JSON response.
```

## 7. Shared Admin UI primitives (to be created by admin task)

Directory `src/components/admin/`:
- `admin-app.tsx` — root: if not logged in → LoginPage; else AdminShell with
  sidebar (`#/admin`, `#/admin/homepage`, `#/admin/about`, `#/admin/services`,
  `#/admin/portfolio`, `#/admin/testimonials`, `#/admin/statistics`,
  `#/admin/inquiries`, `#/admin/media`, `#/admin/navigation`, `#/admin/footer`,
  `#/admin/seo`, `#/admin/social`, `#/admin/settings`, `#/admin/blog`,
  `#/admin/account`) + mobile Sheet drawer + topbar with "View Site" link and
  logout. Guard: `useEffect` + `useQuery(['auth-me'])`.
- `crud/entity-form.tsx` — generic controlled form renderer driven by field defs.
- `crud/crud-manager.tsx` — generic list+create/edit/delete manager for entity pages.
- `image-picker.tsx` — image select dialog: choose from `/api/admin/media`,
  upload new, or paste URL. Shows preview.

Field def type:
```ts
export type FieldDef =
  | { key: string; label: string; type: 'text'|'textarea'|'number'|'date'|'color'; placeholder?: string; help?: string; required?: boolean }
  | { key: string; label: string; type: 'switch'; help?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'image'; help?: string }
  | { key: string; label: string; type: 'tags'; help?: string }            // string[] editor
  | { key: string; label: string; type: 'list'; itemFields: FieldDef[]; itemTitleKey?: string; help?: string } // object array editor (add/remove/move up/down)
```

## 8. Conventions for content JSON (admin forms must match these shapes)

Read `src/lib/defaults.ts` for the exact default shapes of `home`, `about`,
`footer`, `seo`, `settings`, `contact_page`, `privacy`, `terms`. Admin content
editors MUST render forms for exactly those fields (nested objects, arrays of
items, switch toggles for `sections`). Save via `PUT /api/content/[key]` with
the FULL JSON object.

## 9. Demo-content honesty rules (MANDATORY)

- Demo content is flagged `isDemo: true` in DB rows (projects, testimonials,
  blog posts). Public pages show a small "Demo Content" badge on such items
  (see `DemoBadge` in `src/components/site/cards.tsx`).
- Never present placeholder content as real client work or real reviews.
- Statistics section displays a note (from home content `statsSection.note`).

## 10. Verification requirements for page code

- Every component `'use client'` at top (except API routes).
- Handle loading (Skeleton), empty (EmptyState), and error states.
- All images need descriptive alt text. Long lists scroll with dd-scrollbar.
- Responsive: mobile-first; grids `sm:grid-cols-2 lg:grid-cols-3` etc.
- Accessibility: semantic headings, aria-labels on icon-only buttons.
- No TypeScript `any` leaks where a proper type exists; keep strict.
