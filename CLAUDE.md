# massive-design

Standing instructions. `AGENTS.md` is a symlink to this file. Everything that happened lives behind a pointer, not here.

이 프로젝트의 질문과 출력은 한국어를 기본으로 한다. 앱 개발자와 방문자가 읽는 한국어 글(Storybook 문서·루트 README·패키지 README·온보딩 가이드·공개 API 에러 메시지)을 쓰거나 고칠 때는 먼저 [`docs/agents/writing-ko.md`](docs/agents/writing-ko.md)를 읽는다.

## Rules that bind later work

**Read the 축·이름 공간, 토큰과 대비, 포인터 기하, 의존성과 base, 방법론 subjects of [`docs/agents/rules.md`](docs/agents/rules.md) before opening a component, adding an axis, or touching a token** — those survived ADR-0023. Sections marked 1세대 (계약·`parts`·파생 채널·radix) are history and do not bind new code.

## Agent skills

- **Issue tracker** — GitHub Issues (`flameware/massive-design`) via `gh`. See [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- **Triage labels** — five canonical roles, used verbatim. See [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).
- **Repo context graph (graft)** — get context from `graft ask`·`graft grep`·`graft callers` before grepping or opening source. See [`docs/agents/graft.md`](docs/agents/graft.md).
- **Domain docs** — single-context: `CONTEXT.md` and `docs/adr/`. See [`docs/agents/domain.md`](docs/agents/domain.md).
- **First-generation runbooks** under `docs/agents/` carry a banner and describe tools that no longer exist — read them as history, never as instructions. List in [`docs/agents/repo-state.md`](docs/agents/repo-state.md#1세대-런북).

## Where the work stands

`gh issue list --label wayfinder:map --state open` is the authority; this block summarises it and may lag by a day. Detail: [`docs/agents/repo-state.md`](docs/agents/repo-state.md).

- **지금 열린 맵은 없다.** Phase 1·2·3가 모두 닫혔고 [ADR-0023](docs/adr/0023-second-generation-base-ui.md)이 2세대(Base UI)의 결정 전부를 담는다. 컴포넌트는 전부 `stable`이다 — **깨는 변경은 major다.**
- **게시된 최신은 `0.6.4`다** — #463, 입력 계열의 쉬는 면을 `bg.surface`로 옮기고 회색은 무력화된 입력에만 남겼다. 그 앞의 버전들은 [`docs/releases.md`](docs/releases.md).
- **패키지 스코프는 `@flameware`다**([ADR-0024](docs/adr/0024-package-scope-follows-the-registry-owner.md)). 1세대 문서의 `@massive/*`는 기록이므로 고치지 않는다.
- **Figma는 보류다** (ADR-0023 §9). 스냅숏 툴링이 삭제돼 요청이 와도 만들 수 없다.
- 1세대 코드·Figma 툴링·shadcn alias 층은 태그 `v1-shadcn`에만 있다.

Closed maps and their records: [`docs/handoff/README.md`](docs/handoff/README.md).

## Definition of done

A code change is done when `bun run check` and `bun run test` pass (CI) and the PR is reviewed. The storybook test is the main seam and needs Chromium. `check.yml`의 `paths-ignore`에만 걸리는 변경은 로컬 `check`·`test`도 생략한다. What each gate runs: [`docs/agents/definition-of-done.md`](docs/agents/definition-of-done.md).

## Keeping this file

This file holds standing instructions and what is **open** — not the project's memory. **Keep it under 80 lines**; detail goes to a doc behind a one-line pointer. When a version is published or a map closes, follow [`docs/agents/keeping-agents-md.md`](docs/agents/keeping-agents-md.md).
