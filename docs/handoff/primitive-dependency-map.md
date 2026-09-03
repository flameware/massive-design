# primitive·의존성 기반 확정 맵 완료 기록

맵 [#141](https://github.com/flameware/massive-design/issues/141) · 규칙은 [`../agents/rules.md`](../agents/rules.md)

## What the map reached

The **primitive·의존성 기반 확정** map ([#141](https://github.com/flameware/massive-design/issues/141)) is complete — four tickets, two ADRs, and **no code change at all**, which is what it set out to be: the owner made it planning-only, so its deliverable is a decision and the ground later compatibility arguments stand on. Two rules come out of it:

## Two things that outlive the map

Two things that map turned up outlive it. **`@massive/ui` declares no `sideEffects` itself** — we were in the state we were about to fault others for, and `["*.css"]` is the accurate declaration. And **`react-is` is a runtime peer no workspace package declares**, satisfied by accident through `storybook → @testing-library/dom → pretty-format`; blocking it fails even the smallest build, so every check passing meant a dev dependency was quietly covering, and that cover does not exist outside the repo. Both fixes are packaging, move no contract or manifest hash, and go out as their own effort — as does the automated floor-cost gate, which waits on measuring whether Vite/Rollup/webpack judge an undeclared `sideEffects` the way bun does; committing a baseline before that would have the gate manufacture the very silence it exists to catch.
