# 동작을 계약이 선언하고 확인표를 생성한다

Toast의 스와이프를 [ADR-0005](0005-inherited-dismiss-gestures.md)가 `gestures`로 얕게 계약하면서, 같은 판정이 **컨트롤 제스처는 이 계약 밖이다**라고 적었다. 그 문장은 참이다 — Slider·Scroll Area·Carousel의 드래그는 표면을 없애지 않고 키보드 동등 경로가 이미 각 계약 안에 있다. 그런데 "밖"이 **"어디에도 없음"**을 뜻하게 방치됐다.

열림 계기도 같은 자리에서 밀려났다. `CONTEXT.md`가 *"구성 상태가 아니라 동작이므로 파생 채널이 나르지 않는다"*고 판정했고, 그래서 `openOn`은 `cva` 축도 `configurationStates`도 아니다 — 생성된 카탈로그 스토리가 두 번째 모드를 한 번도 렌더하지 않으므로 **Storybook axe가 두 모드에 대해 아무것도 말하지 않는다**.

그리고 세 번 샜다. [#124](https://github.com/flameware/massive-design/issues/124)·[#125](https://github.com/flameware/massive-design/issues/125)가 Carousel·Resizable의 드래그를 지나가면서 runbook을 건드리지 않았고, [#126](https://github.com/flameware/massive-design/issues/126)이 `openOn`을 만들며 `design-system-sync.md`에 손으로 쓴 절을 두어 **한 번은 메웠는데**, [#127](https://github.com/flameware/massive-design/issues/127)이 곧바로 그 절 밖의 사례를 냈다 — Radix `NavigationMenu`의 `delayDuration`·`skipDelayDuration`은 우리가 타이핑하지 않고도 우리 이름으로 나가는 hover 열림 표면이다. 조사 중에 반대 사례도 나왔다: `TooltipProvider`의 `delayDuration = 300`은 **우리가 정한** 값인데도 계약 어디에도, runbook 어느 절에도 없다.

그래서 **`gestures`와 나란한 `behaviors` 필드를 세우고, 확인표를 생성물로 만든다.**

- **한 필드에 종류를 값으로 둔다** — `kind`가 `control-gesture`와 `open-cause`를 가른다. 셋을 가르는 것은 뜻이지 **공백의 모양**이 아니다. 셋 다 *"동작이라 파생 채널이 나르지 않는다"*는 한 가지 이유로 밀려났고 그래서 같은 자리에서 샜다. 필드를 종류마다 나누면 넷째 종류가 올 때 또 샌다 — 그게 방금 `openOn`이 겪은 일이다.
- **값은 적지 않고 `origin`만 가른다** — `inherited`인지 `ours`인지가 확인표를 가른다. 상속이면 사람이 upstream 기본값이 그대로인지까지 보고, 우리 값이면 의도대로인지만 본다.
- **빈 객체라도 적는다** — 51개 계약 전부가 `behaviors`를 갖는다. `configurationStates`와 같은 근거다.
- **확인표는 `bun run sync:checklist`가 찍는다** — 항목의 **문장**은 종류마다 같아서 runbook이 산문으로 갖고, **어디를 보는가**만 계약에서 나온다.

## 고려한 대안

- **runbook이 목록을 갖는다** — 계약은 그대로 두고 사람이 `design-system-sync.md`의 목록을 유지한다. 가장 싸다. 그러나 이건 방금 **세 번 실패한 방식**이고, #126이 절을 하나 쓰자 #127이 그 절 밖으로 나가는 데 한 세대가 걸렸다.
- **종류마다 필드를 나눈다**(`controlGestures`·`openCauses`) — 각 필드의 검사가 종류에 딱 맞는다. 그러나 넷째 종류가 오면 다시 필드가 없어 다시 샌다. 지금 `behaviors`가 메우는 구멍이 정확히 그 모양이다.
- **`gestures`를 흡수해 하나로 합친다** — 세 종류가 한 지붕에 앉아 대칭이 깨끗해진다. 그러나 계약이 지는 무게가 다르다 — dismiss 제스처는 **접근성 동등 경로가 필수 요건**이고(표면이 사라지고 되돌릴 수단이 없다) `behaviors`는 존재만 선언한다. 합치면 ADR-0005가 세운 "얕게 계약한다"의 깊이가 흐려지고, `equivalent`가 선택 필드가 되어 요건이 권고로 내려앉는다.
- **값(200ms·700ms·50px)까지 계약한다** — 확인표가 "지연 후 열린다"보다 정확해진다. ADR-0005가 이미 기각한 대안이고 근거가 그대로 걸린다: 물려받은 값을 계약에 박으면 upstream이 기본을 바꿔도 우리가 유지해야 하는 약속이 된다. `origin`이 같은 일을 값 없이 한다.
- **변경 범위로 확인표를 좁힌다** — 해시가 움직인 컴포넌트만 찍는다. 리포에 "직전 repo 세대" 기준선이 없어(`repo-verification.json`은 매 실행 덮어쓰고 `figma-baseline.json`은 Figma 세대다) **이 결정이 새 기준선 개념을 하나 만든다** — [#106](https://github.com/flameware/massive-design/issues/106)과 Combobox 세대가 "기록이 존재하지 않는 세대를 가리킨다"로 두 번 당한 자리다. 무엇보다 이 자리의 실패 양식은 피로가 아니라 **빠짐**이었다.

## 파급

**게이트는 `gestures`와 정확히 같은 층까지 지킨다.** `kind`가 열거 안인가, `surface`가 우리 anatomy인가, `origin`이 둘 중 하나인가, `why`가 있는가. **빠뜨림은 여전히 못 본다** — 서드파티 소스를 읽어야 "이 primitive가 무엇을 갖고 오는지"를 알기 때문이다(ADR-0005). 필수 필드가 하는 일은 검출이 아니라 **침묵을 선언으로 바꾸는 것**이다: 새 컴포넌트를 계약하는 사람이 `behaviors`를 만나 한 번은 묻는다(ADR-0006).

**`behaviors`는 매니페스트에 내보내지 않는다.** ADR-0005가 `gestures`에 대해 적은 근거가 그대로다 — 파생 채널이 나르는 것은 anatomy와 구성 상태뿐이고, 내보내면 Figma가 할 일이 없는데도 세대 해시가 움직여 [#115](https://github.com/flameware/massive-design/issues/115)의 폰트 되돌림·재바인딩 사이클이 시각 변화 없이 한 번 돈다. 그래서 이 세대는 **51개 계약을 전부 고치고도 매니페스트 해시를 하나도 움직이지 않는다.**

**`sync:checklist`는 `sync:preflight` 뒤에 선다.** 열림 계기의 "기본 모드 불변" 항목이 이번 세대의 `manifestHash`를 요구하고 그 정본은 `verification/repo-verification.json`이다. 이 순서가 runbook에 손으로 박혀 있던 해시(`dropdown-menu = 6fbac9bfcf45`, `popover = 2535c4105bf4`)를 대신한다.

**선언되지 않은 자리는 여전히 침묵이다.** 이 세대가 채운 것은 아는 아홉 자리뿐이고, 나머지 43개 계약은 `behaviors: {}`로 서 있다 — 그 빈 객체는 *"갖고 오는 것이 없다"*가 아니라 *"아직 안 봤다"*일 수 있다. 24개 `radix-ui` primitive와 Embla·react-resizable-panels의 상호작용 기본값 전수 조사가 이 판정에 딸려 온다([#187](https://github.com/flameware/massive-design/issues/187)). 조사 중에 종류가 하나 더 필요할 수 있다 — Embla의 `watchFocus`(포커스가 슬라이드를 스크롤시킨다)는 제스처도 열림 계기도 아니고, `MenubarMenu` 사이의 hover 전환은 열림 계기이되 트리거가 아니라 **이미 열린 형제**가 계기다.
