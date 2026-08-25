## Setup

No provider/wrapper is required — components read tokens straight from CSS custom properties on `:root`/`.dark`, not React context. Just mount into a dedicated node after loading the two files:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```
```jsx
const { Button, Card, CardHeader, CardTitle, CardContent } = window.MassiveUi;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Card>...</Card>);
```

**Dark mode** is a single class toggle: add `.dark` to any ancestor (commonly `<html>` or the mount root) and every token repaints — there is no per-component dark prop. Never branch a component's own classes on a dark condition; only the semantic token layer knows about light/dark.

## Styling idiom: semantic Tailwind utility classes, not raw colors

Every component is styled with Tailwind v4 utilities bound to this DS's own semantic CSS variables (via `@theme inline` in `tokens/tokens.css`) — **never** hex codes or the raw numbered palette (`--ds-palette-*`, internal only). Compose UI with these classes:

| Class | Use |
|---|---|
| `bg-primary` / `text-primary-foreground` | primary/solid actions |
| `bg-secondary` / `text-secondary-foreground` | secondary surfaces |
| `bg-destructive` / `text-destructive-foreground` | destructive actions |
| `bg-muted` / `text-muted-foreground` | de-emphasized text/surfaces |
| `bg-card` / `text-card-foreground`, `bg-popover` / `text-popover-foreground` | elevated surfaces |
| `border` | default border (resolves to `--border` via Tailwind's default border color — no need to write `border-border`) |
| `ring-ring`, `border-focus-contrast` | the two-layer focus ring (outer brand ring + inner neutral-contrast ring) |
| `text-link` | link-colored text (NOT `text-primary` — that fails body-text contrast) |
| `shadow-xs` … `shadow-md` | light-mode elevation (dark mode uses a border instead — see below) |

Radius/shadow/spacing scales (`rounded-md`, `shadow-xs`, etc.) already resolve through `tokens/tokens.css` — use the scale name, never an arbitrary value.

**Hover/pressed states use a `state` utility, not opacity tricks.** This DS has no separate hover/active color tokens; instead add the `state` class plus a `--ds-state-base` custom property naming the base color, and hover/press/disabled are handled automatically via a `color-mix` layer:

```jsx
<button className="state [--ds-state-base:var(--primary)] bg-primary text-primary-foreground rounded-md px-4 py-2">
  거래 추가
</button>
```

Never write `hover:bg-primary/90` or similar opacity-based hover overrides — this DS's own components don't do that, and it bypasses the state-layer system entirely. `ghost`-style variants (no background) use bare `state` with no `--ds-state-base`. Dark-mode surface elevation is a `border`, not a bigger shadow — `shadow-xs` is light-mode only.

## Where the truth lives

- `styles.css` — the one stylesheet to link; it `@import`s `tokens/tokens.css` and the compiled component CSS. Read it and its imports before hand-writing any class.
- `tokens/tokens.css` — every CSS custom property, verbatim names (see table above for the ones to actually use).
- `components/components/<Name>/<Name>.prompt.md` — real usage examples per component (variant axes, required samples).

## Example

```jsx
const { Card, CardHeader, CardTitle, CardContent, Badge, Button } = window.MassiveUi;

<Card className="max-w-sm">
  <CardHeader>
    <CardTitle>투자 요약</CardTitle>
  </CardHeader>
  <CardContent className="flex items-center justify-between">
    <Badge variant="default">수익</Badge>
    <Button variant="default" size="sm">거래 추가</Button>
  </CardContent>
</Card>
```
