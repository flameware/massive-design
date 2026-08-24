# massive-design

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Where the work stands

The **토큰 파운데이션** map ([#1](https://github.com/flameware/massive-design/issues/1)), **컴포넌트 맵** ([#14](https://github.com/flameware/massive-design/issues/14)), and **P0 카탈로그 확장 구현 맵** ([#78](https://github.com/flameware/massive-design/issues/78)) are complete. Their code and decisions live in `packages/`, `apps/storybook/`, `docs/tokens/`, and `docs/agents/figma-*.md`; [`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff into the completed component map.

When updating code-derived Storybook or Figma channels, start with `bun run sync:preflight`, then follow `docs/agents/design-system-sync.md` for Figma and human checkpoints.
