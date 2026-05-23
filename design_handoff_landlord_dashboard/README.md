# Handoff: BillBee — Landlord Dashboard

## Overview

BillBee is a web-based rental billing system for landlords and administrators in the Philippines. This handoff covers the **landlord-facing Dashboard** — the page a landlord lands on after sign-in. It surfaces portfolio health, urgent items, and the most common quick actions.

This is the **first** screen in the broader landlord experience. The handoff also includes consolidated **wireframes** (low-fidelity) for the rest of the landlord workflow as design reference for what comes next.

## About the Design Files

The HTML files in `design-references/` are **design references created in HTML** — prototypes showing the intended look, behavior, and structure. **They are not production code to copy directly.**

The task is to **recreate these designs in the project's existing stack** (React 19 + Tailwind CSS v4, per `context/simple.PRDv1.md` §22), following the established patterns and component library of that codebase.

If no codebase exists yet, scaffold per the PRD stack and implement the Dashboard there.

## Fidelity

- **`design-references/Dashboard.html`** — **HIGH-FIDELITY** mockup. Recreate this **pixel-perfectly**: exact colors, typography, spacing, hover states. Design tokens below are authoritative.
- **`design-references/Wireframes v2.html`** — **LOW-FIDELITY** wireframes covering 17 screens of the full landlord workflow. Hand-drawn sketch style. Use only for **structure and flow context** — apply the hi-fi design system from `Dashboard.html` when you actually build those other screens later.

## Target Stack

From `context/simple.PRDv1.md` §22:

| Tool | Purpose |
|------|---------|
| React 19 | Frontend UI |
| Tailwind CSS v4 | Styling |

Use **Tailwind CSS v4** with a custom theme matching the design tokens below. Component library is **not specified** — choose lightweight headless primitives (Radix UI, or roll your own) and style with Tailwind.

---

## Design Tokens

These tokens are extracted directly from `Dashboard.html` and reflect the user's saved tweak values: **honey amber palette, Inter Tight display, compact density, 8px card radius**.

### Color tokens

Define these as CSS custom properties (or in `tailwind.config.js` `theme.extend.colors`). Hex values are authoritative.

```css
/* surfaces & ink */
--bg:             #FBFAF6;  /* page background — warm off-white */
--surface:        #FFFFFF;  /* cards */
--surface-2:      #F6F3EC;  /* secondary surface (hover, icon backgrounds) */
--border:         #ECE7DD;  /* default card border */
--border-strong:  #DAD3C4;  /* hover border, axis lines */
--border-subtle:  #F4F0E8;  /* dashed grid, dividers */

--ink:    #1A1816;  /* primary text, primary buttons */
--ink-2:  #4A453E;  /* secondary text, body copy */
--ink-3:  #847E74;  /* muted text, labels */
--ink-4:  #B5B0A6;  /* placeholder, disabled */

/* accent (honey amber) */
--accent:       #E89B2B;  /* CTAs, brand mark, current-month highlight */
--accent-2:     #B5751A;  /* accent hover, gradient end */
--accent-soft:  #FBEFD0;  /* tinted backgrounds, icon backgrounds */
--accent-tint:  #FDF7E3;  /* extra-light tint, banner backgrounds */

/* status / semantic */
--success:       #2E7D4A;  /* paid, deltas up */
--success-soft:  #DBEDDC;
--warning:       #C68B0F;  /* partial, attention */
--warning-soft:  #FCF1D2;
--danger:        #C0392B;  /* overdue, errors, deltas down */
--danger-soft:   #FADBD3;
--info:          #2A6FDB;  /* informational, neutral accents */
--info-soft:     #DCE8FB;
```

### Typography

```
Display / headings:  "Inter Tight", system-ui, sans-serif    (weights 500, 600, 700)
Body:                "Inter", system-ui, sans-serif           (weights 400, 500, 600, 700)
Mono / numbers:      "Geist Mono", ui-monospace, monospace    (weights 400, 500)
```

All three loaded from Google Fonts.

**Type scale** (used on the dashboard):

| Use | Family | Size | Weight | Letter spacing | Line height |
|---|---|---|---|---|---|
| Page title (h1) | Inter Tight | 28px | 700 | -0.02em | 1.1 |
| Card title | Inter Tight | 16px | 600 | -0.01em | 1.3 |
| Brand wordmark | Inter Tight | 18px | 700 | -0.02em | 1.3 |
| Stat value | Inter Tight | 26px | 700 | -0.02em | 1.1 |
| Body | Inter | 14px | 400 | normal | 1.45 |
| Sub / caption | Inter | 12.5px | 400 | normal | 1.45 |
| Stat label | Inter | 12.5px | 500 | normal | 1.45 |
| Section eyebrow | Inter | 11px | 600 | 0.06em uppercase | 1.45 |
| Mono numbers | Geist Mono | 14px | 500-600 | normal | 1.45 |
| Tiny mono (kbd, IDs) | Geist Mono | 11px | 400 | normal | 1.45 |

### Spacing scale

4px base. Use Tailwind's default scale (1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64).

**Compact density** (user-selected) values:

```
--pad-card:  16px   /* card padding */
--gap-grid:  10px   /* grid gap between cards */
--pad-row:   8px    /* row vertical padding */
```

If you support a density toggle later, "comfortable" maps to `20px / 14px / 12px`.

### Radii

```
--r-sm:    6px    /* small chips, segmented control inner buttons */
--r:       10px   /* buttons, inputs, icon backgrounds */
--r-lg:    8px    /* cards (compact-density value selected by user) */
--r-pill:  999px  /* pills, avatars, icon-buttons, badges */
```

> The user explicitly tuned `--r-lg` to **8px** during review.

### Borders & elevation

- Cards use a **1px solid `--border` border**, **no box-shadow** by default.
- Hover lifts the border to `--border-strong` (no shadow change).
- The notification badge uses a 2px solid `--bg` border to "punch through" its host icon button.
- The user avatar in the sidebar uses a `linear-gradient(135deg, var(--accent), var(--accent-2))` background.

### Transitions

All hover transitions: `120ms` linear, properties = `background, border-color, color, transform` as appropriate.

---

## Screens

### 1) Dashboard (HIGH-FIDELITY)

**File:** `design-references/Dashboard.html`
**Route:** `/landlord/dashboard` (suggested) — landlord's default landing page after sign-in

**Purpose:** Give the landlord a snapshot of their portfolio + the next thing they should do. Bias toward action: the chart shows collection health, the stat cards surface urgent counts (unpaid / overdue), and the Quick Actions card foregrounds the most common workflows.

#### Layout

Top-level grid: **2 columns, `240px | 1fr`**, full viewport height, no shadows between regions.

```
┌──────────┬────────────────────────────────────────┐
│          │  Topbar (60px, sticky)                 │
│ Sidebar  ├────────────────────────────────────────┤
│ (240px,  │  Main content                          │
│ sticky)  │  max-width: 1320px, padding 28px 32px  │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

Main content (top to bottom):

1. **Page head** — `flex space-between`, wraps on narrow viewports
   - Left: title `"Good evening, Maria 👋"` + subtitle line
   - Right: two buttons (`Search` ghost-style; `Generate Bills` accent CTA)
2. **Heads-up banner** — full-width amber-tinted callout, 24px bottom margin
3. **Stat grid** — `grid-template-columns: repeat(4, 1fr)`, gap = `--gap-grid` (10px compact), one row of 8 cards = 2 rows × 4 cards
4. **Row split** — `grid-template-columns: 2fr 1fr`, gap = `--gap-grid`
   - Left (2fr): Collections chart card
   - Right (1fr): Quick actions card

#### Responsive breakpoint

Below **1100px** viewport width:
- Stat grid collapses to `repeat(2, 1fr)` (8 cards in 4 rows of 2)
- Row split collapses to single column (chart on top, actions below)

#### Components on the Dashboard

##### Sidebar (`240px` wide, sticky to top, full viewport height)

Layout: vertical flex, 20px top padding, 12px horizontal padding.

Items (top to bottom):
1. **Brand** — `[hexagon SVG, 26×26, honey accent] BillBee` — wordmark in Inter Tight 18/700/-0.02em, color `--ink`, 16px bottom padding inside the section, 4px horizontal padding
2. **Nav links** (8) — each link is `flex` with 10px gap, 8px/12px padding, 10px border-radius, font 14/500
   - `Dashboard` (active by default — bg `--ink`, text `--surface`)
   - `Properties`
   - `Rooms`
   - `Tenants`
   - `Charge Catalog`
   - `Billing Center`
   - `Payments & Receipts`
   - `Reports`
3. **`flex: 1` spacer**
4. **Settings** nav link
5. **User card** — 32px circular avatar (honey gradient, initials in white Inter Tight 600/13), name + email column. Hover: subtle `--surface-2` background.

Icons are 18×18 lucide-style strokes (1.75 width). Inactive icon stroke = `--ink-3`; active = `--surface`; hover state = `--ink`. See the inline SVG `<symbol>` defs in `Dashboard.html` for exact paths.

Nav link states:
- Default: `color: --ink-2`, transparent background
- Hover: `background: --surface-2`, `color: --ink`
- Active: `background: --ink`, `color: --surface`

##### Topbar (60px tall, sticky, `--bg` background, 1px bottom border in `--border`)

- 32px horizontal padding
- **Search input mock** (visual only on dashboard — opens a real palette on click):
  - 7×12 padding
  - 1px solid `--border`, 10px radius
  - `min-width: 280px`
  - Icon (search, 16×16, `--ink-3`) + label "Search tenants, bills, properties…" + `<kbd>⌘K</kbd>` flush-right
  - Hover: border → `--border-strong`
- **Spacer** (`flex: 1`)
- **Notification icon button** — 36×36 circular, 1px border `--border`, bell icon (18×18). Badge: top-right, accent background, white text 10/500 Geist Mono, min-width 16, 2px solid `--bg` outline, count = "3" in this mock.

##### Page head

- Title `h1` Inter Tight 28/700/-0.02em, color `--ink`, 4px bottom margin
- Subtitle: 14/normal `--ink-3`. Inline strong text uses `--ink-2`/600. The "3 days" pill uses `color: --accent-2`, `font-weight: 600`.
- Right buttons: 8px gap. `Search` = default button (white, border `--border`, ink text). `Generate Bills` = accent button (background `--accent`, white text 600, no border highlight; hover → `--accent-2`).

##### Heads-up banner

- Layout: horizontal flex, 16px gap, 14/18px padding
- Background: `--accent-tint` (#FDF7E3)
- Border: 1px solid `--accent-soft` (#FBEFD0)
- Border radius: 14px (NOTE: keeps 14px here, not the `--r-lg` 8px — banner has its own rounded shape)
- Left: 36×36 circular accent icon (`--accent` bg, white clock icon)
- Middle: text — "Heads up." in `--ink`/600, rest in `--ink-2`/normal
- Right: small primary button "Start prep →" (ink background, white text, 5/10 padding, 12.5px)

##### Stat cards (×8)

Each card:
- 1px solid `--border`, 8px radius, white background, `--pad-card` padding (16px compact)
- Hover: `border-color → --border-strong`, no transform
- **Stat head row**: flex space-between, 10px bottom margin
  - Label: 12.5/500 `--ink-3`, `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`
  - Icon wrapper: 28×28, 6px radius, default `--surface-2` background + `--ink-3` icon
    - Variants: `.accent` (accent-soft / accent-2), `.warn` (warning-soft / warning), `.danger` (danger-soft / danger), `.success` (success-soft / success)
- **Value**: Inter Tight 26/700/-0.02em color `--ink`, 2px bottom margin
  - For `attention` variant: `color: --accent-2`
  - For `danger` variant: `color: --danger`
  - Peso symbol prefix on monetary values: `<span class="currency">₱</span>` rendered in `--ink-3`/600
- **Sub line**: 12/normal `--ink-3` with optional inline **delta pill**:
  - `delta.up`     → `bg: --success-soft, color: --success`
  - `delta.down`   → `bg: --danger-soft, color: --danger`
  - `delta.neutral` → `bg: --surface-2, color: --ink-3`
  - Pill style: Geist Mono 11.5/500, 1px/6px padding, 4px radius

The 8 stat cards in order (label · value · sub · icon variant):

| # | Label | Value | Sub | Icon | Value variant |
|---|---|---|---|---|---|
| 1 | Properties | `2` | `all active` (neutral delta) | building | default |
| 2 | Rooms | `14` | `11 occupied · 3 vacant` | door | default |
| 3 | Active tenants | `18` | `+2 this month` (up delta) | users | default |
| 4 | Receipts this month | `11` | `+3 vs last mo.` (up delta) | receipt | default |
| 5 | Draft bills | `0` | `ready to generate` | file | default |
| 6 | Unpaid posted | `6` | `₱19,645 outstanding` (neutral delta) | clock | accent icon, **attention** value (`--accent-2`) |
| 7 | Overdue | `2` | `₱8,200 · oldest 12 days` | alert-triangle | danger icon, **danger** value (`--danger`) |
| 8 | Collected this month | `₱42,300` | `68%` (up delta) · `of ₱61,945 billed` | coins | success icon |

##### Collections chart card (left of bottom row, 2fr)

Card uses the same surface treatment (white, 1px border, 8px radius, `--pad-card`).

**Header** (card-head, flex space-between with `flex-wrap: wrap`):
- Left: title `"Collections — last 6 months"` (Inter Tight 16/600/-0.01em) + sub `"billed vs collected · all properties"` (12.5/normal `--ink-3`)
- Right (10px gap):
  - Legend (3 swatches, 12px font, 16px gap between items):
    - `billed` — 10×10 swatch in `--surface-2` with `--border-strong` 1px border
    - `collected` — 10×10 swatch in `--ink`
    - `this month` — 10×10 swatch in `--accent`
  - Segmented control (`3M / 6M / 1Y`):
    - Container: `--surface-2` background, 1px `--border`, 10px radius, 2px inner padding
    - Buttons: 4/10 padding, 12.5/500, default `--ink-3` color
    - Active: white background, `--ink` color, subtle shadow `0 1px 2px rgba(0,0,0,0.05)`, 6px radius
    - Default to `6M` active

**Chart body** — SVG, viewBox `0 0 660 240`, full-width, fixed height ~240px.

Grouped vertical bar chart, 6 months, two bars per month (billed left, collected right).

Layout:
- Y-axis labels (₱0, ₱20k, ₱40k, ₱60k, ₱80k) — Geist Mono 10px, `--ink-3`, right-anchored at x=42
- Dashed gridlines at each label level: stroke `--border-subtle`, dasharray "2 4"
- Baseline (x-axis) gridline: solid `--border`
- Per month group:
  - Month label below at y=220 — Inter 11/normal `--ink-3` (current month bumped to 600 weight + `--ink`)
  - **Billed bar** — left of pair, 32px wide, fill `--surface-2`, 1px stroke `--border-strong`, 4px corner radius
  - **Collected bar** — right of pair, 32px wide, fill `--ink`, 4px corner radius
  - **Current-month override** — same dimensions, but: billed bar fill `--accent-soft` + stroke `--accent`; collected bar fill `--accent`; month label bumped to 600 weight `--ink`
- **Tooltip** on current month (always shown for the mock): black rounded-rect (90×28, 6px radius, `--ink` fill) above the current group, with "collected" label (Inter 10/normal in rgba white 60%) + "₱28,000" value (Geist Mono 12/600 white)

Exact bar heights (height in px, y = 200 - height):

| Month | Billed | Collected |
|---|---|---|
| Oct | 124 (y=76)  | 117 (y=83)  |
| Nov | 131 (y=69)  | 126 (y=74)  |
| Dec | 140 (y=60)  | 106 (y=94)  |
| Jan | 151 (y=49)  | 142 (y=58)  |
| Feb | 153 (y=47)  | 144 (y=56)  |
| Mar | 140 (y=60)  | 63  (y=137) (highlighted current) |

(These translate to roughly: Oct ₱55k/₱52k, Nov ₱58k/₱56k, Dec ₱62k/₱47k, Jan ₱67k/₱63k, Feb ₱68k/₱64k, Mar ₱62k/₱28k.)

**Chart footer**:
- 1px top border in `--border-subtle`, 16px top padding, 16px top margin
- 4 inline KPIs (24px gap):
  - `68% collected this month`
  - `96% avg over 6 mo`
  - `₱318k total collected`
  - `updated just now` (right-aligned, color `--ink-4`, 11.5px)
- KPI numbers (the "v" spans): Geist Mono 14/600 `--ink`
- KPI labels: 12.5/normal `--ink-3`

##### Quick actions card (right of bottom row, 1fr)

Header same pattern: title "Quick actions" + sub "the things you do most".

Body: vertical flex, 8px gap, 5 buttons.

Each button (`.action-btn`):
- Horizontal flex, 12px gap, 12/14 padding, 1px solid `--border`, 10px radius, `--surface` background
- Layout: icon wrap (36×36, 6px radius, `--surface-2` bg, 18×18 icon in `--ink-2`) + text column + right chevron (16×16, `--ink-4`)
- Text: label (14/600 `--ink`) + sub (12/normal `--ink-3`)
- Hover: `background: --surface-2, border-color: --border-strong`

**Primary action** (first item, "Generate bills") gets the dark treatment:
- Background `--ink`, border `--ink`
- Icon wrap `rgba(255,255,255,0.1)` bg, white icon
- Label white, sub `rgba(255,255,255,0.65)`
- Chev `rgba(255,255,255,0.4)`
- Hover → `background: --ink-2, border-color: --ink-2`

The 5 actions in order:

| # | Label | Sub | Icon | Primary? |
|---|---|---|---|---|
| 1 | Generate bills | prep this month's billing run | file | **yes** |
| 2 | Record payment | log a cash / bank / e-wallet payment | check-circle | no |
| 3 | Add tenant | assign to a room & attach charges | users | no |
| 4 | Add property | set up a new building | building | no |
| 5 | View reports | billing, collection, overdue | bar-chart | no |

---

## Icons

All icons are inline SVG, Lucide-style, **1.75 stroke width**, `stroke="currentColor"`, no fill (except the brand hexagon mark). 18×18 default render size for nav and action icons; 14×14 for stat-card icons and inline button icons; 16×16 for chevrons and search.

Symbol IDs used (paths in `Dashboard.html` SVG defs):

- `i-home`, `i-building`, `i-door`, `i-users`, `i-receipt`, `i-file`, `i-check` (check-circle), `i-chart` (line chart), `i-settings`, `i-search`, `i-bell`, `i-plus`, `i-arrow-right`, `i-chev-right`, `i-alert` (triangle), `i-clock`, `i-coins`, `i-bee` (brand hex)

**Recommendation**: install `lucide-react` and use it directly — the icon set matches nearly 1:1. The brand mark is the only custom icon — keep it as an SVG component.

**Brand mark** (logo hexagon) — exact paths, color via `--accent`:

```html
<svg width="26" height="26" viewBox="0 0 24 24">
  <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z"
        fill="var(--accent)" opacity="0.18"
        stroke="var(--accent)" stroke-width="1.5"/>
  <path d="M12 7 L17 9.5 L17 14.5 L12 17 L7 14.5 L7 9.5 Z"
        fill="var(--accent)"/>
</svg>
```

---

## Interactions & Behavior

The Dashboard is mostly read-only with navigation actions. Specific interactions:

| Element | Action |
|---|---|
| Nav links | Navigate to respective landlord pages |
| Brand wordmark | Navigate to `/landlord/dashboard` |
| Search input (in topbar) | Open a command palette (Cmd/Ctrl+K) — out of scope for this handoff; render as visual only for now |
| Notification bell | Open notification dropdown (see Wireframes v2 → Notifications screen for spec) |
| User card | Open account menu (sign out, profile, settings) |
| "Generate Bills" header CTA | Navigate to `/landlord/billing/generate` |
| "Search" header button | Same as Cmd/Ctrl+K — opens palette |
| Heads-up "Start prep →" | Navigate to `/landlord/billing/generate?property=sunset-apts&period=2026-03` (deep link with prefilled context) |
| Stat cards | Optionally clickable — navigate to the relevant filtered list (e.g. "Overdue" → `/billing?status=overdue`). Style the entire card with `cursor: pointer` and a hover treatment if you make them clickable. |
| Chart segmented control (3M/6M/1Y) | Change the chart's time range. Re-render bars + KPIs. |
| Action cards | Each action navigates to its respective creation flow:<br>• Generate bills → `/billing/generate`<br>• Record payment → opens record-payment drawer or navigates to bill picker<br>• Add tenant → `/tenants/new`<br>• Add property → `/properties/new`<br>• View reports → `/reports` |
| All hover/active states | 120ms linear transitions on `background`, `border-color`, `color` |
| Focus | All buttons get a 2px solid `--accent` outline with 2px offset on `:focus-visible` (keyboard only) |

### Density toggle (optional follow-up)

The user can toggle the layout density. Implement as a setting or theme switch:

- **Comfortable**: `--pad-card: 20px; --gap-grid: 14px; --pad-row: 12px`
- **Compact** (default per user pick): `--pad-card: 16px; --gap-grid: 10px; --pad-row: 8px`

Apply via a `data-density` attribute on `<html>` or `<body>`.

---

## State Management & Data

Per PRD §9.1, Dashboard widgets are:

- Total properties, total rooms, occupied rooms, vacant rooms, active tenants
- Draft bills, unpaid posted bills, overdue bills
- Payments received this month, recent activities

Adapt these to the 8 stat cards as mapped above. Recent activities are **intentionally omitted** from the Dashboard in this design — they live in the audit log / notification inbox per spec.

### Suggested data shape (Inertia.js props)

```ts
// pages/landlord/Dashboard.tsx props
interface DashboardProps {
  user: { name: string; email: string; avatarInitials: string };
  greeting: string;                 // "Good evening, Maria 👋"

  nextBilling: {
    propertyName: string;           // "Sunset Apartments"
    daysUntil: number;              // 3
    cycleUrl: string;
  } | null;

  stats: {
    properties: { value: number; activeCount: number };
    rooms: { value: number; occupied: number; vacant: number };
    activeTenants: { value: number; deltaThisMonth: number };
    receiptsThisMonth: { value: number; deltaVsLastMonth: number };
    draftBills: { value: number; readyToGenerate: boolean };
    unpaidPosted: { value: number; outstandingPHP: number };
    overdue: { value: number; outstandingPHP: number; oldestDays: number };
    collectedThisMonth: { collectedPHP: number; billedPHP: number; percent: number };
  };

  collections: {
    range: "3M" | "6M" | "1Y";
    series: Array<{ month: string; year: number; billed: number; collected: number; isCurrent: boolean }>;
    aggregates: { collectedThisMonthPct: number; avgPct: number; totalCollectedPHP: number };
  };

  notifications: { unreadCount: number };
}
```

### Charts

The chart is currently a static SVG in the mock. For production, use **Recharts** or **Visx** (both work well with React 19) — match the styling above. Tooltips on hover for non-current bars; current month shows tooltip by default.

### Caching

Per PRD §22, Redis is included for caching. Cache the Dashboard aggregates with a short TTL (60–120s) keyed by landlord ID, since they hit billing/payment/tenant tables.

---

## Authorization

Per PRD §5 & §7.1, the Dashboard requires:

- Authenticated user
- Role = Landlord
- `email_verified_at` set
- MFA setup complete
- Account status = `Active`

If any are missing, redirect to the corresponding blocked-state screen (verification pending / MFA setup / suspended). Use Laravel Fortify + a route middleware stack.

Landlords only see **their own** data — scope all Eloquent queries by `landlord_id`. Use policies/gates per the PRD §5 to enforce.

---

## Assets

- **Fonts**: Inter Tight, Inter, Geist Mono — load from Google Fonts. Subset to Latin if you can.
- **Icons**: Lucide (use `lucide-react`) + 1 custom SVG brand hexagon (paths above).
- **No images / illustrations** are used in the Dashboard. The user avatar is text initials on a honey gradient.

---

## Files in this package

```
design-references/
├── Dashboard.html            ← THE HI-FI DASHBOARD. Open in a browser. This is the source of truth.
├── Wireframes v2.html        ← 17-screen lo-fi wireframes for the rest of the landlord workflow.
├── sketch/                   ← Shared styles + primitives used by Wireframes v2.html
├── screens-v2/               ← Individual screen JSX files for Wireframes v2.html
├── app-v2.jsx                ← Wireframes v2.html bootstrap
└── hifi/
    └── tweaks-panel.jsx      ← Tweaks panel used in Dashboard.html. Not needed in production.

context/
├── simple.PRDv1.md           ← Full PRD. Read at least §1–7 (landlord scope) + §22 (stack).
└── ui.workflow.md            ← Detailed workflow + state rules + validation. Read end-to-end.
```

## Implementation order (suggested)

1. **Scaffold** — set up Tailwind v4 theme with the color tokens, font imports, and density variables.
2. **Layout shell** — sidebar + topbar as the persistent landlord app shell. Use Inertia layouts.
3. **Dashboard page** — implement the 4 zones (page head → banner → stat grid → chart+actions row).
4. **Wire data** — Eloquent queries + Inertia props per the suggested shape above. Use Redis cache for aggregates.
5. **Chart** — Recharts or Visx, match the spec exactly.
6. **Polish** — hover/focus/transition states, responsive collapse at 1100px.
7. **Empty/loading states** — if any stat is zero, show its current value (don't hide the card). If data is loading, render skeletons that match the stat card dimensions.

---

## Questions to resolve before implementing

These intentionally weren't decided in design — flag with the team:

1. **Are stat cards clickable?** Recommended yes (each filters the relevant list page), but the design works either way.
2. **Chart library** — Recharts, Visx, or hand-rolled SVG? The mock uses hand-rolled SVG. Recharts matches the look closely.
3. **Empty / zero-data states** — what does the chart show if the landlord has 0 bills? (Suggest a "no data yet" placeholder with the same chart dimensions.)
4. **Command palette (Cmd+K)** — in scope or deferred? The dashboard's search input gestures at it.
5. **Mobile** — out of scope for this handoff but worth confirming. Sidebar should collapse to a drawer; topbar stays; main content stacks single column.
