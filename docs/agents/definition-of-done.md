# Definition of done — 상세

A code change is done when `bun run check` and `bun run test` pass (CI) and the PR is reviewed.

## `check`

Runs the tokens gates (`lint` → `contrast` → `verify`), the `@flameware/ui` primitive-leak and state-ladder gate (the grep test ADR-0023 §12 keeps), the `ui` build (`tsc` emitting `dist`, which is where the `.d.ts` for every subpath comes from) and `tsc` on `storybook`.

## `test`

Runs `node --test` in `tokens`, `ui` and `storybook`.

- The `ui` tests are the package smoke (subpath resolution, types, `"use client"` boundary, floor-cost cap) plus the Tailwind emission test — the one that catches a class name that silently produces no CSS.
- **The storybook test is the main seam** (#279): it builds Storybook, opens every story in Chromium and measures axe violations, the 24×24 pointer floor and each story's declared keyboard contract — so CI needs Chromium (`bunx playwright install --with-deps chromium`, already a step in both workflows).

There is no derived channel to sync.

## 검사를 건너뛰는 변경

`check.yml`의 `paths-ignore`에만 걸리는 변경은 어떤 검사도 읽지 않으므로 `check` 워크플로가 돌지 않고 로컬 `check`·`test`도 생략한다. 경로 목록의 근거는 언제나 그 `paths-ignore`이고, 문서라도 테스트가 읽는 `CONTEXT.md`·`docs/tokens/**`·`packages/**`·`apps/**`는 거기에 없다(#453).
