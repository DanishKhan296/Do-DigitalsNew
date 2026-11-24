# Task 4-c — Premium Visual Redesign: Public Pages (Portfolio / Blog / 404 / Legal)

Agent: 4-c
Date: redesign pass over six public page files only. No other files modified, no new files created.

## Files rewritten (all at /home/z/my-project/src/components/pages/)

### 1. portfolio-page.tsx
- Preserved: `useProjects({category, search})` wiring, `useCategories`, category chips, search input, demo-content Alert (hasDemo), result count, loading skeleton, EmptyState, FilterChip component.
- Redesigned: PageHero (eyebrow "Portfolio", CharReveal title "Work That Speaks"); chips restyled rounded-full with active `bg-primary shadow-lg shadow-primary/30`; taller rounded search input.
- NEW asymmetric gallery: `RevealGroup` grid `lg:grid-cols-6`, spans `[4,2,2,4,3,3]`. Wide (span-4) cells use a locally-defined `FeatureProjectCard` (overlay style: image cover with `scale-[1.06] duration-1000` hover, `from-black/80` gradient, glass category pill, dd-display white title, short desc, rotating ArrowUpRight circle on hover, DemoBadge top-right for isDemo). Narrow cells use the shared `ProjectCard`. Skeleton mirrors the asymmetric spans.
- Added `CtaBanner` at end (settings-aware, portfolio-themed WhatsApp message).

### 2. portfolio-detail-page.tsx
- Preserved: `useProject(slug)`, category `useProjects` for related, `useSettings`, `document.title` effect, loading skeleton + `isError` EmptyState, gallery array, technologies, client/completionDate/category meta, WhatsApp `similarMessage` (mentions project title), DemoBadge, related-projects section.
- Redesigned: cinematic dark hero `bg-[#060807] text-white` with breadcrumb (Home / Portfolio / title), glass category pill + DemoBadge, `dd-huge` CharReveal title, short description, glass meta chips (date/client/category), hero image in `dd-gradient-border rounded-[2rem]` inside `Parallax`.
- Body: RichText in `max-w-3xl`, technologies as outlined primary badges, sticky side card (`lg:sticky lg:top-28`, dd-gradient-border) with meta dl + WhatsApp (bg-[#25D366]) + Contact + View All Projects.
- Gallery as asymmetric grid (`lg:grid-cols-12`, spans 8/4/4/8 cycling, RevealImage `rounded-[1.5rem]`, aspect-enforced cells). Related section + `CtaBanner` at end. (Old thumbnail-strip `selectedImage` state replaced by the grid gallery per redesign spec.)

### 3. blog-page.tsx
- Preserved: `useBlogPosts()` client-side filtering exactly (derived categories, filtered array), demo Alert (allDemo), result count, loading skeleton, EmptyState, FilterChip.
- Redesigned: PageHero (eyebrow "Insights", title "Ideas, Guides & Growth Notes"); chips + search styled like portfolio. Editorial split: first post = local `FeaturedBlogCard` (overlay card `lg:col-span-8`, gradient, glass category pill, date, dd-display white title, excerpt, rotating ArrowUpRight, isDemo badge, `scale-[1.06] duration-1000` hover) + next two BlogCards stacked `lg:col-span-4`; remaining posts in 3-col `RevealGroup` grid of BlogCard. Skeleton mirrors the split.

### 4. blog-detail-page.tsx
- Preserved: `useBlogPost(slug)`, category `useBlogPosts` for related, `useHomeContent`, `useSettings`, shareAnchorRef WhatsApp-share DOM-sync effect, `document.title` effect, `copyLink` + sonner toasts, loading skeleton + isError EmptyState, tags, DemoBadge, share row, related section, CtaBanner wiring.
- Redesigned: dark cinematic header band `bg-[#060807]` with breadcrumb Home/Blog/title, category pill + DemoBadge, `dd-huge` CharReveal title, glass meta chips (date, category, first 2 tags); cover image in `dd-gradient-border rounded-[2rem]` with Parallax (slight negative-margin overlap); body RichText `max-w-3xl` with CSS drop-cap on first paragraph (`first-letter:` variants, text-primary); tags as outlined badges; author footer card "Written by the Do Digitals team" (dd-gradient-border, brand-gradient Sparkles avatar, settings tagline) + Work With Us button.

### 5. not-found-page.tsx
- Preserved: routeHref links for home/services/portfolio/contact/blog.
- Redesigned: full-viewport centered scene (`min-h-[calc(100svh_-_4rem)]`), giant floating `dd-giant dd-outline-text` "404" with brand blur behind, OrbitRings, GlowOrbs, NoiseOverlay, dd-spotlight + grid lines; SVG dashed flight-path with drifting Plane icon; CharReveal heading "This runway doesn't exist"; flight-metaphor description; Back to Home (Magnetic + dd-shine h-14 primary) + View Portfolio (outline) buttons; suggestion chips (Services / Blog / Contact); kept "Lost? We build maps for brands too" footer line.

### 6. legal-page.tsx
- Preserved: `useContent('privacy'|'terms')` wiring, loading skeleton, EmptyState, `document.title` effect, PageHero texts.
- Redesigned: content in a single `max-w-3xl` `dd-gradient-border rounded-[2rem] p-6 sm:p-10` card with RichText; optional "Last updated" chip (CalendarDays badge, rendered only when `content.lastUpdated` exists — type extended with `lastUpdated?: string | null`); GlowOrb ambience; Reveal entrance.

## Verification
- `bun run lint` → exit 0, no errors.
- `tsc --noEmit` → zero errors in my six files. Remaining project tsc errors are in files I must not touch (home-page.tsx, site/premium.tsx, examples/, skills/) — pre-existing, unrelated.
- Dev server: `GET / 200`, no compile errors in dev.log.
