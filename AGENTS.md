# massive-design

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Where the work stands

The **토큰 파운데이션** map ([#1](https://github.com/flameware/massive-design/issues/1)), **컴포넌트 맵** ([#14](https://github.com/flameware/massive-design/issues/14)), **P0 카탈로그 확장 구현 맵** ([#78](https://github.com/flameware/massive-design/issues/78)), **P1 카탈로그 확장 구현 맵** ([#88](https://github.com/flameware/massive-design/issues/88)), and **P2 카탈로그 확장 구현 맵** ([#118](https://github.com/flameware/massive-design/issues/118)) are complete — 51 components. The P2 map closed the last **component-level** gap against shadcn/ui: eight built (Kbd, Input OTP, Resizable, Sidebar, Carousel, Chart 축소, Menubar, Navigation Menu), two absorbed as trigger modes of components we already had (Context Menu → Dropdown Menu, Hover Card → Popover), one ruled out for having no surface (Aspect Ratio). Their code and decisions live in `packages/`, `apps/storybook/`, `docs/tokens/`, and `docs/agents/figma-*.md`; [`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff into the completed component map.

Three rules from the P1 and P2 maps bind later catalog work:

- **An item that derived channels cannot tell apart does not get its own component** ([#97](https://github.com/flameware/massive-design/issues/97)). Manifests and Figma carry anatomy and configuration state, not behaviour, so a behaviour-only variant cannot satisfy the "code, Storybook and Figma in one generation" completion definition. This is the rule that ruled Drawer out against Sheet, and it governs P2 triage.
- **A composed component consumes the original rather than copying it** ([#91](https://github.com/flameware/massive-design/issues/91)). Combobox imports Command and Popover; copying would fork their keyboard contracts.
- **A third-party library owns the nodes we do not give a `className` to, and the contract must say so** ([#122](https://github.com/flameware/massive-design/issues/122)). The boundary is class ownership; each externally-owned surface is listed in `externalSurfaces` with its own reason. Ownership reaches further than nodes — it takes inline styles ([#124](https://github.com/flameware/massive-design/issues/124)) and prop name spaces ([#125](https://github.com/flameware/massive-design/issues/125)) too. Its corollary: **we do not re-export a third-party component through our barrel**, because a surface cannot be ours and theirs at once.

Open follow-ups, each large enough to want its own charting: the touch target size rule and the verification-runbook amendment it implies ([#111](https://github.com/flameware/massive-design/issues/111)), the `--ds-bg-neutral-solid` alias gap ([#109](https://github.com/flameware/massive-design/issues/109)), and the eight **uncontracted surfaces** promoted out of the existing 43 ([#121](https://github.com/flameware/massive-design/issues/121) adjudicated them) — each verdict and its reasoning already sits in the component's `limits`, so that effort starts at execution, not investigation. One exception: Dropdown Menu's `CheckboxItem`/`RadioItem`/`Sub` were never in #121's population at all, so they need investigation first ([#127](https://github.com/flameware/massive-design/issues/127) found the hole).

The P2 map left four open questions in its **Not yet specified** — the Base UI migration (our 24 primitives are all `radix-ui`; upstream leads with Base UI), the dependency weight `recharts` added, configuration-state modifiers landing as `unresolved` in manifests, and control gestures having neither automated checks nor a runbook hook. Figma is now eleven generations behind code; Figma Sync runs only on an explicit request, in its own issue.

When updating code-derived Storybook or Figma channels, start with `bun run sync:preflight`, then follow `docs/agents/design-system-sync.md` for Figma and human checkpoints.
