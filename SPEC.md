# Ben's Model Railway — Site Specification

## Overview
A polished, showcase website for Ben's model railway project. The railway is a 00 gauge layout featuring real-life-inspired locations (skewed/scaled to fit a base board), with Fusion 360 for 3D modelling, model railway software on Mac, and the eventual goal of Gaussian splat visualization.

**Tagline:** "A life-size railway in miniature"
**Repo:** github.com/benjaminjob1/bens-model-railway

---

## Site Structure (Single-Page App with Sections)

### Nav
Sticky top nav: Home | The Layout | Build Journal | 3D Renders | Software | Contact

### 1. Home / Hero
- Full-width hero: dark atmospheric railway photo (placeholder or CSS gradient), site title "Ben's Model Railway", tagline, and a subtle scroll indicator
- Brief intro paragraph: what this is — a detailed 00 gauge model railway project at Mum's house, blending real locations with fictional adaptations
- Quick stats bar: Gauge (00), Scale (1:148), Era (modern image), Baseboard dimensions (TBC)
- CTA: "See the Layout ↓"

### 2. The Layout
Sub-sections:
- **2D Track Plan** — SVG track diagram viewer (placeholder initially, Ben adds image later)
- **3D Model Viewer** — `<model-viewer>` web component (Google) showing STEP/OBJ export from Fusion 360. Loads a placeholder model initially.
- **Gaussian Splat** (future) — section reserved, shows "Coming soon" with note about photogrammetry scan on completion

### 3. Build Journal
Blog-style chronological entries. Each entry has: date, title, description, optional photo thumbnail.
- Initial entries: "Project Started", "Planning the Baseboard", "Choosing the Location" (Ben fills these in later)
- Section heading: "Follow the build — updates every progress"

### 4. 3D Renders
Gallery of Fusion 360 renders. Grid layout with lightbox/overlay on click.
- "Coming soon — renders will appear here as the build progresses"
- Accepts images (PNG/JPG)

### 5. Software & Hardware
Two-column layout:
- **Software:** RailwayController software (Mac), Fusion 360, any other tools
- **Hardware:** Track, rolling stock, control equipment, baseboard specs

### 6. Contact / Footer
- "Follow the build on GitHub →" link to repo
- Small footer: © 2026 Ben's Model Railway

---

## Technical Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (classy, dark theme)
- **3D:** `@google/model-viewer` (React wrapper or vanilla web component via CDN)
- **Deployment:** Vercel (static export or SSR)
- **Font:** Inter or something distinctive (railway/vintage feel — maybe "Playfair Display" for headings + "Source Sans Pro" for body)

---

## Color Palette & Theme
Dark, moody, atmospheric — like a railway at dusk/night:
- Background: `#0f1117` (near-black)
- Surface: `#1a1d26`
- Accent: `#d4a843` (brass/gold — railway lamp colour)
- Text primary: `#f0f0f0`
- Text muted: `#8a8fa0`
- Border: `#2a2d38`

---

## Interactions
- Smooth scroll between sections
- Nav active state highlights current section
- 3D model viewer: drag to rotate, scroll to zoom, fullscreen option
- Image gallery: click to expand
- Build journal: expandable entries or paginated list
- Mobile responsive (hamburger nav on small screens)

---

## Deployment
- Deploy to Vercel via CLI (`vercel --prod`)
- Custom domain: `railway.benjob.me` (Ben adds CNAME in Cloudflare → Vercel)

---

## Placeholder Content
Use realistic placeholder content so the site looks polished before Ben adds real media:
- Hero: CSS gradient with grain texture (atmospheric dark blue-grey)
- 3D model: a publicly available free STEP/OBJ model (e.g. a locomotive from GrabCAD or a simple train model on Sketchfab's CDN)
- 2D track plan: simple SVG drawing of a basic oval with some sidings
- Build journal: 2-3 placeholder entries
- 3D renders gallery: 3 placeholder images from Unsplash (train/railway themed)

## Workflow
1. Create the Next.js app
2. Install dependencies (Tailwind, model-viewer, etc.)
3. Build all sections
4. Test locally
5. Push to GitHub
6. Deploy with `vercel --prod`

