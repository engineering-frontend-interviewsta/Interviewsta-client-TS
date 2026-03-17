# Styling Plan – Top-Down, Consistent Purple Theme

Apply styling **from the top layer down** so global decisions flow to layouts, then pages, then components. Use **external CSS** for maintainability: `index.css` for global styles, one CSS file per layout/page/component where needed.

## Theme

- **Primary:** Purple (brand)
- **Look:** Minimal, clean, top-notch with subtle animations where it makes sense.

---

## Layer 1 – Global (`src/index.css`)

- **CSS custom properties** for the purple theme (primary, primary-hover, surface, text, borders, radius, shadow).
- **Base:** `html`/`body`, `#root` (full height, no default margin/padding that fights layout).
- **Typography:** Font stack, base size/line-height, heading scale.
- **Global animations:** e.g. `--animate-fade-in`, `--animate-slide-up` (used by components).
- **Focus/selection:** Accessible focus rings and text selection using theme colors.
- Keep Tailwind `@import` so utility classes still work; override only what’s needed with our variables.

---

## Layer 2 – Layouts

- **AppLayout** (app shell: header + main for dashboard, video interview, etc.)
  - `src/layout/AppLayout.css`: header, nav, main wrapper, link/button styles.
  - Use theme variables; minimal, clean; optional subtle transitions on nav hover.
- **LandingLayout** (marketing: header + main + footer)
  - `src/layout/LandingLayout.css`: same idea, consistent with AppLayout header style.

---

## Layer 3 – Pages

- Each major page gets its own CSS file when we touch it, e.g.:
  - `src/pages/Dashboard/Dashboard.css`
  - (Later: VideoInterview, InterviewInterface, Auth pages, etc.)
- Page files define **page-level** wrappers and sections; they use theme vars and avoid duplicating layout rules.

---

## Layer 4 – Components

- Per-component CSS only when it improves clarity, e.g.:
  - `DashboardHeader.css`, `DashboardQuickLinks.css`, `VideoReportsCard.css`, etc.
- Prefer semantic class names (e.g. `.dashboard-header`, `.quick-link`) and theme variables.
- Add subtle animations (fade-in, slide-up) via global animation classes or component-specific keyframes.

---

## Order of implementation

1. **Layer 1** – `index.css` (theme + base + global animations). ✅
2. **Layer 2** – `AppLayout.css`, `LandingLayout.css`; header with nav icons + user dropdown. ✅
3. **Layer 3/4** – Dashboard page + all dashboard components. ✅

## Approach per component (same as header)

For **every** component, apply the same level of analysis:

1. **UX** – Hierarchy, grouping, what belongs visible vs in a dropdown/drawer, icons, clear labels, accessibility (aria, focus).
2. **Visual** – Premium feel (not basic): typography (Inter, weights, spacing), purple theme via CSS variables, subtle shadows and borders, hover/active states.
3. **External CSS** – One `.css` file per component (or shared where it makes sense); semantic class names (BEM-like); use theme vars from `index.css`.
4. **Motion** – Subtle transitions (duration/ease from vars), optional entrance animations; respect `prefers-reduced-motion`.

## Dashboard (done)

- **Dashboard.css** – Page shell, section titles, grid, classroom block (theme vars).
- **DashboardHeader.css** – Welcome + purple CTA button (gradient, shadow, hover lift).
- **DashboardQuickLinks.css** – Card grid, icon + label + description, hover lift and shadow.
- **VideoReportsCard.css** – Shared `.reports-card` pattern; list rows with hover state; “View all” link.
- **ResumeReportsCard.css** – Extends reports card; score block styling.
- **PerformanceOverviewCards.css** – Hero overall card + type grid; purple values and hover on type cards.
- **PerformanceCharts.css** – Trend + breakdown chart containers; empty states.
- **DashboardSkeleton.css** – Shimmer animation; layout mirrors real dashboard; reduced-motion fallback.

Next: apply the same approach to other pages (Video Interview, Interview Interface, Auth, Landing, etc.) and their components.
