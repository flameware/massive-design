# massive-design

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Where the work stands

The **토큰 파운데이션** map ([#1](https://github.com/flameware/massive-design/issues/1)) is complete — all 12 tickets closed. Its decisions live in `docs/tokens/`, its Figma procedure in `docs/agents/figma-injection.md`.

The next effort is the **컴포넌트 맵**, not yet charted. **Read [`docs/handoff/component-map.md`](docs/handoff/component-map.md) before touching components, Storybook, or Figma components** — it is written to be the single entry point for that map's charting session, and it carries the traps that will otherwise be rediscovered the hard way.
