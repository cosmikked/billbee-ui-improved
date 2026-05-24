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

### Dark mode color tokens

Apply via `[data-theme="dark"]` on `<html>` (manual toggle) **and** inside `@media (prefers-color-scheme: dark)` for system auto. The amber accent palette carries through — surfaces shift to warm near-black browns so the brand never reads cold or blue.

```css
[data-theme="dark"],
@media (prefers-color-scheme: dark) {

  /* surfaces & ink */
  --bg:             #191510;  /* page background — warm near-black */
  --surface:        #221D14;  /* cards */
  --surface-2:      #2C2619;  /* secondary surface (hover, icon backgrounds) */
  --border:         #3C3428;  /* default card border */
  --border-strong:  #524A3A;  /* hover border, axis lines */
  --border-subtle:  #272119;  /* dashed grid, dividers */

  --ink:    #F0EBE1;  /* primary text — warm off-white */
  --ink-2:  #C2BAB0;  /* secondary text, body copy */
  --ink-3:  #857D72;  /* muted text, labels (same mid-tone as light) */
  --ink-4:  #504840;  /* placeholder, disabled */

  /* accent (honey amber — slightly brighter for dark-bg contrast) */
  --accent:       #F0A83A;  /* CTAs, brand mark — lifted +1 stop vs light */
  --accent-2:     #D4891E;  /* accent hover, gradient end */
  --accent-soft:  #31230E;  /* dark amber tint (replaces light wash) */
  --accent-tint:  #261B0A;  /* extra-dark tint, banner backgrounds */

  /* status / semantic */
  --success:       #52C27A;  /* paid, deltas up — brighter for dark bg */
  --success-soft:  #142B1D;
  --warning:       #D9A81C;  /* partial, attention */
  --warning-soft:  #2A2108;
  --danger:        #E8534A;  /* overdue, errors, deltas down */
  --danger-soft:   #2E0F0C;
  --info:          #5B95F0;  /* informational, neutral accents */
  --info-soft:     #0D1D3D;
}
```

**Dark mode decisions:**
- Backgrounds use warm brown-blacks (`#191510 → #2C2619`) rather than neutral grays — keeps the honey amber accent feeling at home.
- `--ink-3` is identical in both modes (`#857D72`) — it sits at the perceptual mid-point and needs no shift.
- `--accent` lightens by ~10% in dark mode (`#E89B2B → #F0A83A`) to maintain WCAG AA contrast against dark surfaces.
- All `*-soft` semantic colors invert from light washes to dark tints — same hue family, very low lightness.
- `--surface-2` (hover/secondary) is lighter than `--surface` in both modes — the elevation hierarchy is preserved.

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

