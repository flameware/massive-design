# 레퍼런스를 옮길 때 옮기는 것은 철자가 아니라 뜻이다 (shadcn `accent` ≠ DS accent)

상태: accepted · 2026-09-13 · [#388](https://github.com/flameware/massive-design/issues/388) ([#387](https://github.com/flameware/massive-design/issues/387)의 전수 대조에서 갈라져 나왔다)

#387은 레퍼런스(`.design-sync/sb-reference/`)의 `--ds-state-base` 24곳을 DS 11곳과 전수 대조했다. 대부분은 맞았고 Select·Menu 둘이 틀렸다. 그 대조가 함께 드러낸 것은 **틀린 자리가 아니라 틀리는 방식**이다.

`toggle/toggle.tsx:52`:

```
"data-pressed:text-on-solid data-pressed:[--ds-state-base:var(--ds-bg-accent-solid)]"
```

레퍼런스 원문:

```
state [--ds-state-base:var(--background)]
  data-[state=on]:[--ds-state-base:var(--accent)]
  data-[state=on]:text-accent-foreground
```

**shadcn의 `--accent`는 브랜드색이 아니라 hover용 연회색이다.** 같은 파일의 `--accent-foreground`가 거의 검정인 것이 증거다 — 브랜드 면 위에 놓을 글자색이 아니다. shadcn에서 브랜드는 `--primary`고, 실제로 Button의 default와 Checkbox의 checked가 `--primary`를 받는다.

DS의 `accent`는 브랜드다. **같은 철자가 두 체계에서 정반대를 가리킨다.** Toggle은 그 철자를 그대로 읽어 켜진 상태가 브랜드 솔리드 + 흰 글자가 됐다.

옮긴 사람이 연회색 계열을 못 읽은 게 아니다 — 같은 파일에서 Button의 `secondary`는 `--secondary` → `neutral-soft`로 정확히 옮겼다. **`accent`라는 낱말에서만 걸렸다.**

## 결정 1 — 레퍼런스의 토큰 이름은 번역 대상이지 대응 대상이 아니다

shadcn의 토큰 이름과 DS의 semantic 이름은 **어휘가 겹치지만 뜻이 겹치지 않는다.** 철자가 같다는 것은 대응의 근거가 아니고, 대응이 없다는 근거도 아니다. 옮길 때 물을 것은 "DS에 같은 이름이 있나"가 아니라 **"레퍼런스의 그 이름이 그 자리에서 무슨 일을 하나"**다.

대조표는 새로 지을 필요가 없다. 레퍼런스 번들 자신이 갖고 있다 — 1세대가 shadcn 어휘를 DS 토큰 위에 올리며 쓴 shim이 빌드 산출물에 그대로 남아 있다(`.design-sync/sb-reference/assets/iframe-Xdyc_jWD.css`). **이것이 정본이다**:

| shadcn | DS | 주의 |
| --- | --- | --- |
| `--background` | `--ds-bg-canvas` | |
| `--foreground` | `--ds-fg-default` | |
| `--card` / `--card-foreground` | `--ds-bg-surface` / `--ds-fg-default` | 흐름 안의 면 |
| `--popover` / `--popover-foreground` | `--ds-bg-overlay` / `--ds-fg-default` | 떠 있는 면 (#387) |
| `--primary` / `--primary-foreground` | `--ds-bg-accent-solid` / `--ds-fg-on-solid` | **shadcn의 브랜드는 여기다** |
| `--secondary` / `--secondary-foreground` | `--ds-bg-neutral-soft` / `--ds-fg-default` | |
| `--muted` / `--muted-foreground` | `--ds-bg-subtle` / `--ds-fg-muted` | |
| `--accent` / `--accent-foreground` | `--ds-bg-subtle` / `--ds-fg-default` | **브랜드가 아니다 — hover용 연회색이고 `--muted`와 같은 값이다** |
| `--destructive` / `--destructive-foreground` | `--ds-bg-danger-solid` / `--ds-fg-on-solid` | |
| `--border` | `--ds-border-default` | |
| `--input` | `--ds-border-field` | 면이 아니라 **테두리**다 |
| `--ring` | `--ds-border-focus` | |

거짓 친구는 `accent` 하나가 아니다. `--input`은 이름이 입력의 *면*처럼 읽히지만 테두리고, `--accent`와 `--muted`는 이름이 다른데 같은 값이며(DS에서 `bg.subtle`·`bg.inset`·`bg.neutral.soft`가 한 칸인 것과 같은 사정, #337), `--card`와 `--popover`는 DS에서 **라이트에서만** 같은 값이다.

이 표는 레퍼런스가 무엇을 뜻했는지를 읽는 도구지, 무엇을 써야 하는지를 정하는 표가 아니다. 뜻을 읽은 다음 **DS가 다른 값을 고를 수 있다** — 결정 2가 그 예다.

## 결정 2 — Toggle의 켜짐은 브랜드 솔리드다. 되돌리지 않는다

출처가 오독이어도 **결과가 나쁘지 않다.** Select·Menu(#387)는 결과가 명백히 나빴기 때문에 오류였다 — 흰 팝업 위 회색 항목, 선택과 하이라이트가 같은 색. Toggle은 반대다: 켜짐/꺼짐 대비가 8% 회색보다 브랜드 솔리드일 때 훨씬 세고, Toggle이 실제로 서는 자리(투자기록 앱의 `ToggleGroup` 보유/청산 필터, `notes-view.tsx:11`)에서 "지금 뭐가 켜졌나"는 강하게 보여야 한다.

트레이드오프는 **레퍼런스 충실 ↔ 상태 대비**였고 후자를 골랐다.

문제는 지금까지 그 근거가 한 줄도 없었다는 것이다. 다음 사람이 레퍼런스와 대조하면 이 ADR을 쓰게 만든 과정 그대로 "전사 오류다" 하고 되돌린다. **되돌리는 것이 아니라 못 되돌리게 근거를 박아두는 것이 답이다** — 그래서 `toggle.tsx:52`에 이 ADR을 가리키는 주석이 붙는다.

## 고려한 대안

- **레퍼런스대로 되돌린다** (`--accent` → `bg-subtle`/`neutral-soft`). 출처에는 충실해지지만 앱의 필터 UI가 통째로 약해진다. 되돌리기 비싼 쪽이 이쪽이다.
- **아무것도 적지 않고 둔다.** 지금 상태다. 코드는 맞지만 **다음 대조에서 반드시 오류로 잡힌다** — #387의 전수 대조가 실제로 이 줄을 잡았고, 그때 이 줄을 살린 것은 코드가 아니라 사람의 판단이었다. 판단은 다음 세대에 전달되지 않는다.
- **`--ds-bg-accent-*`를 개명해 철자 충돌 자체를 없앤다.** 소비처가 이미 `text-accent-*`·`bg-accent-*`를 물고 있어 깨는 변경이고, 그 값을 치르고도 다음 레퍼런스의 다음 거짓 친구(`--input`이 테두리인 것)는 그대로 남는다. 충돌은 낱말 하나가 아니라 두 체계가 만나는 자리의 성질이다.

## 파급

- 규칙은 Toggle 한 컴포넌트가 아니라 그 위에 있다. `docs/agents/rules.md`의 **토큰과 대비**에 항목으로 올린다.
- `.design-sync/sb-reference/`는 1세대의 빌드 산출물이고 재생성되지 않는다. 위 표는 그 산출물을 읽은 결과를 이 문서에 고정한 것이다 — 번들이 사라져도 표는 남는다.
- Select·Menu의 실제 수정은 #387·#390(`0.5.1`)이 이미 냈다. 이 ADR은 코드를 바꾸지 않는다. 유일한 코드 변경은 `toggle.tsx:52`의 주석이다.
