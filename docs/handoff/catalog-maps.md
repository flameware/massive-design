# 카탈로그 맵 완료 기록 — 토큰 파운데이션 · 컴포넌트 맵 · P0 · P1 · P2

맵 [#1](https://github.com/flameware/massive-design/issues/1) · [#14](https://github.com/flameware/massive-design/issues/14) · [#78](https://github.com/flameware/massive-design/issues/78) · [#88](https://github.com/flameware/massive-design/issues/88) · [#118](https://github.com/flameware/massive-design/issues/118) · 규칙은 [`../agents/rules.md`](../agents/rules.md)

## What the maps reached

The **토큰 파운데이션** map ([#1](https://github.com/flameware/massive-design/issues/1)), **컴포넌트 맵** ([#14](https://github.com/flameware/massive-design/issues/14)), **P0 카탈로그 확장 구현 맵** ([#78](https://github.com/flameware/massive-design/issues/78)), **P1 카탈로그 확장 구현 맵** ([#88](https://github.com/flameware/massive-design/issues/88)), and **P2 카탈로그 확장 구현 맵** ([#118](https://github.com/flameware/massive-design/issues/118)) are complete — 51 components. The P2 map closed the last **component-level** gap against shadcn/ui: eight built (Kbd, Input OTP, Resizable, Sidebar, Carousel, Chart 축소, Menubar, Navigation Menu), two absorbed as trigger modes of components we already had (Context Menu → Dropdown Menu, Hover Card → Popover), one ruled out for having no surface (Aspect Ratio). Their code and decisions live in `packages/`, `apps/storybook/`, `docs/tokens/`, and `docs/agents/figma-*.md`; [`component-map.md`](component-map.md) is the historical handoff into the completed component map.

## Follow-ups these maps left

The touch target size rule these maps left ([#111](https://github.com/flameware/massive-design/issues/111)) was charted as its own map and is closed — [`pointer-target-map.md`](pointer-target-map.md). The `--ds-bg-neutral-solid` alias gap ([#109](https://github.com/flameware/massive-design/issues/109)) turned out to be a role split, not a missing name; it is the "토큰과 대비" rule in [`../agents/rules.md`](../agents/rules.md).

The P2 map's four open questions are all closed, each as a decision rather than a change: [#140](https://github.com/flameware/massive-design/issues/140) closed two (configuration-state modifiers landing as `unresolved`; control gestures having neither automated checks nor a runbook hook) and [#141](https://github.com/flameware/massive-design/issues/141) closed the other two (the Base UI migration; the dependency weight `recharts` added). Figma's published baseline stands at 43 component sets (`verification/figma-baseline.json`) against 51 in code — [#138](https://github.com/flameware/massive-design/issues/138) carries the target. Figma Sync runs only on an explicit request, in its own issue.
