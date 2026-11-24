# Task 8-b — Admin Dashboard & CMS UI — Work Record

## Status: COMPLETE

All 24 target files created/replaced. TypeScript strict-clean, ESLint-clean for
admin scope. Verified end-to-end against the LIVE API (login, CRUD, content
PUTs, uploads query) and in a real browser (login flow, all 17 modules,
create/edit/delete dialogs, toasts, mobile Sheet drawer, dark/light).

## Files created / replaced

Primitives + app:
- `src/lib/admin-client.ts` — adminFetch (JSON, same-origin, FormData-aware,
  throws server error message), adminGet/Post/Put/Delete, uploadMedia via XHR
  with real progress callback, slugifyText, timeAgo, ApiError (has .status).
- `src/components/admin/crud/entity-form.tsx` — FieldDef renderer (text,
  textarea w/ rows, number, date, color+hex, switch, select, image, tags w/
  optional MediaSelectDialog picker, list editor). Dot-notation paths
  (getPath/setPath), deepClone. Slug fields with autoSlugFrom auto-generate
  until manually edited; pre-filled slugs (edit mode) start "touched" so titles
  never silently change URLs. List editor keeps items in local draft state with
  add/remove/up/down and itemTitleKey titles.
- `src/components/admin/crud/crud-manager.tsx` — generic list manager:
  TanStack Query list, client-side search, desktop Table + stacked mobile
  cards, create/edit Dialog (EntityForm, remounts per open via formSession key),
  required-field validation, delete AlertDialog, inline boolean toggles
  (inlineToggles → PUT {key: checked}), extraInvalidate arrays, empty/error
  states, toasts. Exports StatusDot helper.
- `src/components/admin/image-picker.tsx` — MediaSelectDialog (Library grid /
  Upload with progress / Paste URL tabs) + ImagePicker field (preview,
  choose/replace/remove). Exports useAdminMedia hook (['admin-media']).
- `src/components/admin/admin-guard.tsx` — useAuthMe(['auth-me']), skeleton
  while loading, LoginPage when user null. Exports AdminUser/AuthMeResponse.
- `src/components/admin/admin-shell.tsx` — grouped sidebar (OVERVIEW / CONTENT
  / BUSINESS / INBOX / LIBRARY / SYSTEM), active state via useHashRoute,
  Sheet drawer < lg, sticky topbar (title, View Site, theme toggle, user
  dropdown w/ logout).
- `src/components/admin/login-page.tsx` — branded card, username+password,
  error toasts, loading, hint text (admin / DoDigitals@2025, change after first
  login), auto-redirect to #/admin when already authed.
- `src/components/admin/admin-app.tsx` — REPLACED stub: hash sub-route map,
  standalone login route, shell + guard, 404 card for unknown admin paths.
- `src/components/admin/overview-page.tsx` — 8 real stat cards, recent
  inquiries table (status badges), activity timeline (timeAgo), quick actions,
  demo-content honesty reminder.

Modules (`src/components/admin/modules/`):
- `homepage-page.tsx` — sections visibility switches + full home JSON editor
  (hero incl. two CTA pairs, aboutPreview w/ points tags, servicesSection, why
  items, process steps, testimonialsSection, statsSection note, cta).
- `about-page.tsx` — hero/intro/story/mission/vision/values list/approach/cta.
- `services-page.tsx` — CrudManager: curated 13-icon select, ImagePickers,
  features tags, faqs list editor, published inline toggle, wide dialog.
- `portfolio-page.tsx` — Tabs Projects/Categories; categoryId select loaded
  from /api/admin/portfolio-categories; images tags w/ picker; featured/
  published/isDemo; category CRUD w/ detach warning.
- `testimonials-page.tsx` — CrudManager + honesty warning; rating select 1–5,
  DemoBadge in table, published toggle.
- `statistics-page.tsx` — CrudManager (label/value/suffix/order/visible toggle)
  + demo-figures warning.
- `inquiries-page.tsx` — status filter tabs w/ counts, search, detail Dialog
  (all fields, status Select → PUT, delete, WhatsApp quick reply via waLink).
- `media-page.tsx` — drag-drop upload zone, XHR progress bar, alt/description,
  grid cards (preview, size KB, alt), edit dialog (alt/description/filename),
  copy URL (clipboard + toast), delete confirm.
- `navigation-page.tsx` — CrudManager + note that Services dropdown is managed
  by the Services module.
- `footer-page.tsx` — description/email/whatsapp/address/quickLinks list/
  copyright ({year} help).
- `seo-page.tsx` — site-wide defaults card + Tabs per page (home, about,
  services, portfolio, contact, blog) under `pages.<key>` paths.
- `social-page.tsx` — CrudManager (platform/url/icon select of 7/visible/order).
- `settings-page.tsx` — branding (logos, favicon, color pickers), contact &
  WhatsApp, themeDefault select, maintenanceMode switch w/ amber warning;
  after save caches ['settings'] + applyBrandVars(primary, secondary) live.
- `blog-page.tsx` — posts CrudManager (categoryId select, large content
  textarea w/ format help, tags, status DRAFT/PUBLISHED, seo fields, isDemo) +
  categories side card (add input, delete AlertDialog warns posts detach; also
  a Categories tab on < lg screens).
- `account-page.tsx` — Profile (name/email PUT /api/auth/me), Change Password
  (client validation min 8 + match, POST change-password), Session card
  (username/role/member since + logout).

## Invalidations after mutations
- Content editors: `['content']` (covers home/about/footer/seo/settings).
- CrudManagers: own queryKey + `extraInvalidate` → ['services'], ['projects'],
  ['portfolio-categories'], ['testimonials'], ['statistics'], ['blog'],
  ['navigation'], ['socials'], ['admin-blog-categories'].
- Inquiries also invalidate ['admin-overview'].

## API assumptions (all verified live via curl)
- `ok()` returns raw JSON (no envelope) — matches public hooks.
- Every admin `/[id]` PUT accepts partial bodies (verified per route).
- Slug auto-generated server-side when empty (verified: POST service w/ slug ""
  → slug "test-service").
- PUT /api/content/[key] returns `{success:true}` — not the saved JSON, so
  settings page caches the draft then invalidates.
- Media upload: multipart `file`/`alt`/`description`, ≤5MB, returns asset with
  canonical `/api/media/[id]/raw` URL.

## Verification done
- `bunx tsc --noEmit` — zero errors in admin scope (remaining project errors are
  pre-existing in examples/, scripts/, skills/, site components — not touched).
- `bun run lint` — zero findings in admin scope.
- Live API tests: login, auth/me, overview, services GET/POST/DELETE, inquiries
  PUT (status set + reverted), content/home PUT. Temp data cleaned up.
- Browser (agent-browser): login → dashboard; services edit dialog populated
  incl. FAQs; create+delete navigation item via UI w/ success toast; inquiries
  detail dialog + WhatsApp reply link verified (wa.me/923001234567?text=Hello
  Test User!...); media grid actions; homepage switches; all 17 routes render;
  mobile 390px Sheet drawer opens with 17 links; dark mode toggle verified.

## Notes for integrator (double-check)
1. A benign hydration notice appears because the hash router renders '/' on the
   server and '#/admin/**' on the client — pre-existing app-router design
   (outside my file scope). React recovers by re-rendering client-side.
2. Next.js dev-tools "1 Issue" badge in screenshots is dev-overlay only.
3. Unused `eslint-disable` warnings elsewhere in the repo predate this task.
4. Blog page shows categories as a right side card on lg+ and as a "Categories"
   tab below lg (single-column friendliness); both mutate the same data.
