# 기본 폼 컨트롤은 소비처 근거 없이 만든다 — ADR-0023 §10의 유일한 예외

상태: accepted · 2026-09-13 · [#397](https://github.com/flameware/massive-design/issues/397) · 맵 [#396](https://github.com/flameware/massive-design/issues/396) (두 번째 소비처 숲마루 온보딩 그릴링)

[ADR-0023](0023-second-generation-base-ui.md) §10은 "소비처가 필요의 잣대다"라고 정했고, Phase 3(#365)는 그 잣대로 Switch([#374](https://github.com/flameware/massive-design/issues/374))와 Popover([#373](https://github.com/flameware/massive-design/issues/373))를 **만들지 않고 닫았다** — invest diary에 착지 자리가 0곳이었다. 그 판정은 당시 잣대로 옳았다.

두 번째 소비처 숲마루(apt-finder)가 붙으면서 같은 질문이 다시 왔다. 실측 결과 숲마루도 Switch·Slider를 **쓰는 자리가 0곳**이다(shadcn `switch`·`slider` 파일은 설치만 돼 있고 import가 없다). 즉 이번에 이 둘을 여는 근거는 소비처가 아니다. 근거는 **"이것들은 기본 컨트롤에 가깝다"는 소유자의 판단**이고, 그 판단은 §10을 뒤집는다. 뒤집는다는 사실을 숨기지 않고 적는 것이 이 ADR이다.

## 결정 1 — 네이티브 HTML 입력에 대응하는 폼 컨트롤은 소비처 근거 없이 만든다

판정 기준은 이름 목록이 아니라 한 문장이다: **네이티브 HTML 입력에 대응하는 폼 컨트롤인가.**

| 들어온다 | 네이티브 대응 | 상태 |
| --- | --- | --- |
| Switch | `<input type="checkbox" role="switch">` | 새로 만든다 (#374 재개) |
| Slider | `<input type="range">` | 새로 만든다 (ADR-0023 Phase 3 후보) |
| Radio | `<input type="radio">` | 새로 만든다 (Phase 2에서 자리 0) |
| Input · Textarea · Checkbox · Select · NumberField | 각자 | 이미 있다 |

| 들어오지 않는다 | 이유 |
| --- | --- |
| Popover · PreviewCard | 오버레이 — 입력이 아니다 |
| Accordion · Collapsible | 드러내기 — 입력이 아니다 |
| Meter · Progress | 표시 — 값을 받지 않는다 |
| ScrollArea | 네이티브 스크롤이 이미 답이다 |
| DatePicker | `type="date"`에 대응하지만 서드파티 의존을 문다 — 바닥값([ADR-0017](0017-dependency-weight-is-a-floor-cost.md)) 판정이 따로 필요해 이 예외에 넣지 않는다 |

이름을 적어 예외로 두는 방식(Switch·Slider만)을 고르지 않은 이유: 다음 "기본 아닌가?"가 올 때마다 목록을 다시 논쟁하게 된다. 기준 문장이 있으면 Radio처럼 **같은 논리로 따라 들어오는 것**이 생기는데, 그것이 기준이 일관적이라는 신호다.

## 결정 2 — 예외 밖은 여전히 §10이다

이 ADR은 §10을 폐기하지 않는다. 컴포넌트·프리셋·축의 기본 판정은 계속 **소비처 실측**이고(`rules.md` 방법론, #365의 103토큰 재실측 방식), 도메인에만 뜻이 있는 조립은 소비처가 가진다(`CONTEXT.md` **소비처**). 예외는 결정 1의 기준 하나다.

근거 없이 만든 컴포넌트도 착지가 없으면 `preview`에서 내려오지 못한다는 ADR-0023 §6의 상태 규약은 그대로다 — 다만 이 예외에 한해 **착지 부재가 만들지 않을 이유는 되지 않는다.**

## 고려한 대안

- **숲마루의 예정 화면(가격·평형 범위 필터 등)을 소비처 근거로 인정한다.** 원칙을 지키면서 같은 결과를 얻지만, 예정 화면이 확정되지 않았고 "예정"이라는 근거는 1세대가 자리 없는 컴포넌트를 쌓은 바로 그 경로다.
- **만들지 않고 필요가 생기면 연다** (지금까지의 규칙). 가장 싸지만, 소비처가 둘이 된 뒤에도 폼의 기본 어휘가 비어 있으면 각 소비처가 네이티브 입력을 손으로 스타일링하게 된다 — 대비·24px·키보드 계약을 DS가 지는 이유가 사라진다.
- **WAI-ARIA APG 기본 위젯 전체.** Accordion·Disclosure까지 들어와 예외가 원칙보다 커진다.

## 파급

- ADR-0023의 Phase 표에 이 ADR을 가리키는 포인터를 단다. 원문은 고치지 않는다.
- `CONTEXT.md`에 **기본 폼 컨트롤** 항목을 둔다.
- #374의 NOT_PLANNED 판정은 지우지 않는다 — 당시 잣대로 옳았고, 이 ADR이 잣대를 바꿨다는 기록으로 남는다.
