# massive-design

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Where the work stands

The **토큰 파운데이션** map ([#1](https://github.com/flameware/massive-design/issues/1)), **컴포넌트 맵** ([#14](https://github.com/flameware/massive-design/issues/14)), **P0 카탈로그 확장 구현 맵** ([#78](https://github.com/flameware/massive-design/issues/78)), and **P1 카탈로그 확장 구현 맵** ([#88](https://github.com/flameware/massive-design/issues/88)) are complete — 43 components. Their code and decisions live in `packages/`, `apps/storybook/`, `docs/tokens/`, and `docs/agents/figma-*.md`; [`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff into the completed component map.

Two rules the P1 map settled bind later catalog work:

- **An item that derived channels cannot tell apart does not get its own component** ([#97](https://github.com/flameware/massive-design/issues/97)). Manifests and Figma carry anatomy and configuration state, not behaviour, so a behaviour-only variant cannot satisfy the "code, Storybook and Figma in one generation" completion definition. This is the rule that ruled Drawer out against Sheet, and it governs P2 triage.
- **A composed component consumes the original rather than copying it** ([#91](https://github.com/flameware/massive-design/issues/91)). Combobox imports Command and Popover; copying would fork their keyboard contracts.

Open follow-ups, each large enough to want its own charting: the touch gesture / dismiss contract ([#110](https://github.com/flameware/massive-design/issues/110)), the touch target size rule and the verification-runbook amendment it implies ([#111](https://github.com/flameware/massive-design/issues/111)), the `--ds-bg-neutral-solid` alias gap ([#109](https://github.com/flameware/massive-design/issues/109)), and the eight **uncontracted surfaces** promoted out of the existing 43 ([#121](https://github.com/flameware/massive-design/issues/121) adjudicated them) — each verdict and its reasoning already sits in the component's `limits`, so that effort starts at execution, not investigation. Figma is nine generations behind code; Figma Sync runs only on an explicit request, in its own issue.

When updating code-derived Storybook or Figma channels, start with `bun run sync:preflight`, then follow `docs/agents/design-system-sync.md` for Figma and human checkpoints.
