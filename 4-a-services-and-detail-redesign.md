# Task 4-a — Services Page + Service Detail Page redesign (work record)

## Scope
Rewrote exactly two files (no other files touched, no new files):
- `src/components/pages/services-page.tsx`
- `src/components/pages/service-detail-page.tsx`

## services-page.tsx
- Kept `useServices()`, `useSettings()`, `useHomeContent()`, loading skeleton, EmptyState, per-service data fields (image, icon, title, tagline, shortDescription, features[0..4], whatsappMessage, slug), WhatsApp + View Details CTAs, final `CtaBanner` with `homeContent.cta`. Kept `PageHero`.
- Replaced plain alternating rows with an editorial showcase: alternating image/copy sides, giant `dd-outline-text-green` numerals (01–04), `dd-brand-gradient` icon tiles, `dd-huge` titles, `dd-text-gradient` taglines, 2-col green-check feature lists, Magnetic + dd-shine WhatsApp (#25D366) and outline Details buttons.
- Unique per-service image treatment: 01 straight editorial frame, 02 `FloatingChip` "We Create." overlay, 03 `OrbitRing` pair behind, 04 `dd-gradient-border` + `Parallax`. `RevealImage` clip reveals + group-hover zoom; `GlowOrb` per row; hairline separators; services-title `Marquee` strip under hero; soft grid-lines backdrop; full-width `overflow-hidden` section to guarantee no horizontal overflow.

## service-detail-page.tsx
- Preserved: all hooks (`useService/useServices/useProjects/useHomeContent/useSettings`), `document.title` effect, error EmptyState, loading skeleton, relatedProjects filter (slice 3), otherServices (slice 3), features grid, overview RichText + sticky summary card (WhatsApp + View Portfolio), `ProcessSteps`, related `ProjectCard` grid (DemoBadge handled internally), FAQ Accordion, other-services links, final `CtaBanner` with `service.whatsappMessage`.
- New cinematic dark hero (`bg-[#060807] text-white`, both themes) with per-slug motif config:
  - `graphic-designing` → palette: dd-grid-lines + outlined green numeral watermark + dd-gradient-border image frame
  - `digital-marketing` → growth: dd-spotlight + rising brand/lime gradient bars (`GrowthBars`)
  - `web-development` → browser: stylized browser chrome (traffic-light dots + dodigitals.com URL pill)
  - `software-development` → terminal: terminal window (mono dots + `~/do-digitals $ ./build --your-software`)
  - fallback → default: black panel + double `OrbitRing`
- Breadcrumb (Home / Services / title), Badge, `CharReveal` dd-huge title with `dd-shimmer-text-white` on last word, tagline, shortDescription, Magnetic WhatsApp green + outline-white "Discuss a Project" (`routeHref('/contact')`), Parallax hero image, desktop-only `FloatingChip`s (We Create./We Grow./We Build.), NoiseOverlay + GlowOrbs, bottom gradient hairline.
- Restyled sections to new language: `dd-gradient-border` feature cards with check tiles + icon hover gradient, `dd-gradient-border` sticky summary card and FAQ container, Magnetic view-all, pill-style other-services links with gradient icon tiles.

## Verification
- `bun run lint` → clean (no errors, no warnings).
- `bunx tsc --noEmit` → no diagnostics in either file.
- Dev server: page compiles and serves 200; no runtime errors in `dev.log` after changes.
