The wireframe screenshots are HAND-DRAWN. They show STRUCTURE only.
Never copy from them: colors, fonts, sketchy borders, fills, sticky-note 
annotations, or paper-textured backgrounds.

---

## Element mappings

| Wireframe shows | Use the hifi component |
|---|---|
| Sketchy rounded box / card container | `<Card>` — padding auto from `--pad-card`. Add `<CardHead title="…" subtitle="…" actions={…}>` as first child for a titled card. |
| Stat / metric tile with a big number | `<StatTile label value sub delta icon iconVariant valueVariant onClick>` — `delta` is `{ label: string, variant: 'up'\|'down'\|'neutral'\|'accent'\|'info' }`. Use `iconVariant` for color: `'default'\|'accent'\|'warn'\|'danger'\|'success'`. |
| Page title + subtitle row | `<PageHead title subtitle actions>` — `actions` renders right-aligned (use `<Button>` nodes). |
| Sketchy pill / tag with a bill status | `<StatusBadge status="draft\|posted\|partial\|paid\|overdue\|void">` — pill shape, font-mono, semantic colors. |
| Delta indicator / small tag (▲▼ or count) | `<Pill variant="up\|down\|neutral\|accent\|info">` — font-mono, rounded-xs (4 px). Use `up` for positive, `down` for negative, `neutral` for plain counts. |
| Sketchy button | `<Button variant="default\|primary\|accent\|ghost" size="sm\|md\|lg">` — `default` is the plain bordered style; `primary` is black-fill; `accent` is amber. |
| Icon-only button (bell, search, etc.) | `<IconButton badge={n}>` — 36 × 36 circular. `badge` shows a red dot with count; omit or 0 to hide. |
| Yellow sticky note / informational aside | `<Callout variant="info" icon={<Icon size={18} strokeWidth={1.75}/>}>…</Callout>` — icon is **required**. |
| Yellow tinted callout with "rule reminder" | `<Callout variant="warning" icon={<AlertTriangle…/>}>…</Callout>` |
| Urgent / action callout (billing countdown, etc.) | `<Callout variant="accent" icon={<Clock…/>} action={<Button variant="primary" size="sm">…</Button>}>…</Callout>` |
| Error / destructive alert | `<Callout variant="danger" icon={<AlertCircle…/>}>…</Callout>` |
| Thin dismissible info strip at top of page | `<Banner variant="info\|warning\|danger\|success\|accent" onDismiss={fn}>` — no icon slot; omit `onDismiss` for non-dismissible. |
| Tag/chip with amber accent color | `<Pill variant="accent">` |
| 🔒 lock icon on a row/field | `<Pill variant="neutral" className="gap-1"><Lock size={11}/>locked</Pill>` — add a Radix / title tooltip if hover text is needed. |
| Sketchy table | `<DataTable<T> columns={Column<T>[]} rows getRowKey onRowClick emptyState>` — define `Column<T>` with `{ key, header, cell: (row) => ReactNode, width?, align? }`. Wrap in `<Card noPadding>` to get the card shell without inner padding. |
| Hand-drawn arrow between elements | Drop it — use layout and visual proximity instead. |
| "Wobble" rotation on cards | Drop it — no rotation in hifi. |
| Patrick Hand / Caveat / sketch font | Use the hifi type scale: `font-display` (Inter Tight) for headings, `font-body` (Inter) for body, `font-mono` (Geist Mono) for numbers/codes. |
| Marker orange `#E85A1A` | Use `--color-accent` (`#E89B2B`). Never hardcode hex. |
| Paper / off-white background | Use `--color-bg`. Surface cards use `--color-surface`. |

---

## Spacing rules

Always use token vars — never eyeball from the lofi:

| Context | Token |
|---|---|
| Card inner padding | `style={{ padding: 'var(--pad-card)' }}` (or just use `<Card>`) |
| Grid / column gap | `style={{ gap: 'var(--gap-grid)' }}` |
| Table row vertical padding | `style={{ paddingTop: 'var(--pad-row)', paddingBottom: 'var(--pad-row)' }}` (DataTable handles this automatically) |

---

## Status color reference

| Status | Token pair |
|---|---|
| Draft | `bg-surface-2 text-ink-3` |
| Posted | `bg-info-soft text-info` |
| Partial | `bg-warning-soft text-warning` |
| Paid | `bg-success-soft text-success` |
| Overdue | `bg-danger-soft text-danger` |
| Void | `bg-surface-2 text-ink-4` |

Use `<StatusBadge>` — do not hand-roll these classes.

---

## Quick usage cheatsheet

```tsx
// Titled card
<Card>
  <CardHead title="Section title" subtitle="optional sub" actions={<Button>…</Button>} />
  {/* content */}
</Card>

// Table inside a card (no double-padding)
<Card noPadding>
  <CardHead title="Bills" className="px-[var(--pad-card)] pt-[var(--pad-card)]" />
  <DataTable columns={cols} rows={rows} getRowKey={r => r.id} onRowClick={…} />
</Card>

// Stat tile
<StatTile
  label="Overdue"
  value={12}
  sub="₱18,500 outstanding"
  icon={<AlertTriangle size={14} strokeWidth={1.75} />}
  iconVariant="danger"
  valueVariant="danger"
  onClick={() => navigate('/landlord/billing?status=overdue')}
/>

// Status in a table cell
<StatusBadge status="overdue" />

// Delta pill
<Pill variant="up">+3 this month</Pill>

// Callout with action
<Callout variant="accent" icon={<Clock size={18} strokeWidth={1.75} />}
  action={<Button variant="primary" size="sm">Start prep <ArrowRight size={14}/></Button>}>
  <strong>Heads up.</strong> Rizal St. bills on the 15th.
</Callout>
```
