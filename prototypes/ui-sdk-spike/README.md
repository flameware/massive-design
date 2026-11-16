# UI SDK 스파이크 (#496)

`@flameware/ui`의 primitive 기반을 Base UI에서 [UI SDK](https://ui-sdk.dev/)(`@ui-sdk/react` 0.1.0-beta.5)로 전부 바꿀 수 있는지 잰 프로토타입이다. 게시하지 않는다. 판정은 **Base UI 유지**이고, 근거와 재판단 계기는 [ADR-0023](../../docs/adr/0023-second-generation-base-ui.md) §2의 주석과 [#496](https://github.com/flameware/massive-design/issues/496)에 있다.

## 다시 재는 법

```sh
./setup.sh        # UI SDK를 고정 버전으로 받고 나머지 의존성은 워크스페이스 것을 링크한다
./run.sh all      # 전부 빌드하고 apps/storybook/test의 테스트를 그대로 돌린다
./run.sh combobox # 대상 하나만: form | field | combobox | dialog | drawer | list-row
node checks/form-behavior.mjs  # Form·Field 동작을 원본 빌드와 나란히 잰다
```

`run.sh`는 테스트 파일을 매번 `apps/storybook/test`에서 복사해 온다. 테스트를 고치지 않는다는 것이 합격선이기 때문이다. `checks/form-behavior.mjs`는 `apps/storybook/storybook-static`(원본 빌드)과 `runs/form`·`runs/field`가 있어야 돈다.

재판단할 때는 `package.json`의 `@ui-sdk/*` 버전을 올리고 `./run.sh all`의 실패 수를 본다. 2026-11-16의 결과는 통과 91, 실패 1이다.

## 구조

- `src/` — UI SDK 위에 다시 세운 컴포넌트. 파트 이름은 UI SDK를 따라 평면형이다(`DialogContent`, `FieldLabel`).
- `stories/` — `apps/storybook/stories`의 사본. 마크업만 바꿨고 키보드 계약과 `data-testid`는 원본 그대로다. "스파이크 전용"이라고 적힌 스토리는 원본에 없는 것이다.
- `.storybook/` — `@spike/ui`를 `src/`로, `@flameware/ui`를 `packages/ui/src`로 잇는다. 옮기지 않은 것(Button·Toggle·토큰·스타일)은 게시 패키지의 소스를 그대로 쓴다.
- `runs/` — 빌드와 실행 결과. 커밋하지 않는다.

## 통과시키려고 조립을 바꾼 스토리

Combobox 스토리 둘은 마크업만 고쳐서는 통과하지 못했다. 재판단 때 이 둘을 원본 조립으로 되돌려 보는 것이 첫 확인이다.

- `InsideDialog` — 콤보박스를 다이얼로그보다 한 커밋 늦게 연다. 같은 커밋에 열면 팝업이 다이얼로그 밑에 깔린다.
- `EmptyResult` — 초기 검색어를 `defaultQuery` 대신 controller의 `setQuery`로 넣는다. `defaultQuery`는 필터를 걸지 않는다.
