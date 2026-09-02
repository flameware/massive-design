# primitive 기반은 `radix-ui`에 머무른다 — 기반은 하나이고, 바꾸는 쪽이 입증한다

[#120](https://github.com/flameware/massive-design/issues/120)이 upstream shadcn/ui가 **Base UI를 1차 구현으로 제시한다**는 사실을 기록했다. 우리 51개 중 primitive에 기대는 24개는 전부 `radix-ui`다. [#150](https://github.com/flameware/massive-design/issues/150)이 두 라이브러리의 차이를 전수 조사하고 [#151](https://github.com/flameware/massive-design/issues/151)이 의존성 무게를 실측한 뒤, [#152](https://github.com/flameware/massive-design/issues/152)가 판정한다.

**지금 깨진 것은 없다.** upstream은 세 갈래를 모두 문서화하고 우리 51개는 전부 통과하며, [#150](https://github.com/flameware/massive-design/issues/150) §7.1이 Radix 갈래의 **공개된 deprecation 시한이나 sunset 약속을 찾지 못했다**고 빈손으로 끝난 검색 여섯을 기록해 두었다. 이것은 불을 끄는 일이 아니라 앞으로의 호환성 논의가 설 전제를 고정하는 일이다.

## 결정

**primitive 기반은 `radix-ui`로 유지한다. 지금 이행하지 않는다.**

### 1. 입증 책임은 이행하려는 쪽에 있다

[#118](https://github.com/flameware/massive-design/issues/118) 규칙 2 — *서드파티 의존성은 대가를 계약에 적는 조건으로 허용한다* — 를 **기반 선택에도 같은 기준으로 적용한다**. "upstream이 1차로 제시한다"는 그 자체로 근거가 아니다. 따라서 기본값은 머무름이고, 이행하려는 쪽이 *primitive에서 실제로 얻는 것*이 더 낫다는 것을 입증한다.

지금 재료로 그 입증은 **실패한다**. 문서로 확인된 것을 세면 이렇다.

| | 확인된 것 |
|---|---|
| 얻는 것 | **하나** — Base UI `render`는 함수 `(props, state) => ReactElement`를 받아 내부 상태로 마크업을 가를 수 있다. boolean `asChild`는 구조적으로 못 한다. 둘은 superset 관계다 |
| 잃는 것 | **셋** — Accordion의 roving focus를 Base UI가 APG 개정에 따라 **제거했다**고 문서가 명시한다 · Tabs의 `activateOnFocus` 기본값이 `false`(수동 활성화)라 우리 `activationMode="automatic"`이 나르는 동작이 뒤집힌다 · **독립 `Label` 컴포넌트가 없다**(`Field.Label`이나 네이티브 `<label>`로 내려앉는다) |

24개 중 23개가 등급상 움직이는 대가로 확인된 이득이 확장점 하나면 값이 맞지 않는다. 나머지 넷("동작이 다름" 여덟 중 `menubar`·`navigation-menu`·`popover`·`dropdown-menu`)은 **확인 불가**이고, 알려지지 않은 것은 이행을 정당화하지 못한다 — 입증 책임이 이행 쪽에 있다는 것의 뜻이 정확히 그것이다.

### 2. 판정의 형태는 조건부 유예이고, 트리거는 사건 기반만 둔다

이진 판정("결정됐다, 다시 논의하지 않는다")이 아니다. 아래 사건 중 하나가 일어나면 재판정을 연다.

1. upstream이 **Radix 갈래의 문서화를 내리거나** deprecation 시한·sunset을 공개한다.
2. `radix-ui`가 우리가 기대는 **React peer 범위를 잃는다**.
3. Base UI가 위 표의 **잃는 것 셋 중 하나를 되찾는다**(Accordion roving focus · Tabs 자동 활성화 기본값 · 독립 `Label`).
4. **리포 밖 소비처가 생겨** breaking 비용의 셈이 달라진다(지금은 리포 안 하나뿐이다).

**날짜 기반 재검토는 두지 않는다.** 날짜는 아무것도 재지 않으므로 맵 [#141](https://github.com/flameware/massive-design/issues/141)의 규칙 2(*비용은 세어서 적는다*)를 만족하지 못한다.

### 3. 기반은 하나다 — 이 판정은 앞으로 들어올 컴포넌트도 구속한다

판정 대상은 기존 24개의 이행 여부가 아니라 **`@massive/ui`의 primitive 기반 그 자체**다. 새 컴포넌트가 primitive를 필요로 할 때도 `radix-ui`에서 찾는다. 절대 금지가 아니라 [#118](https://github.com/flameware/massive-design/issues/118) 규칙 2와 **같은 형태**의 규칙이다: 다른 기반을 들이려면 **대가를 계약에 적고 그 자리에서 이 ADR의 재판정을 연다.**

기반이 하나여야 하는 이유는 검증이다. 기반이 둘이면 접근성 동작·키보드 계약·`data-*` 어휘가 컴포넌트마다 갈리고, 그 갈라짐은 트리거를 거쳐 일어나지 않는다 — **사고로 일어난다.**

### 4. 이 판정의 증거 등급은 문서 기반이고, 재판정은 실물 대조를 선행 조건으로 갖는다

[#150](https://github.com/flameware/massive-design/issues/150)은 1차 출처 문서만 읽었고 **설치된 소스나 실제 DOM에 대고 검증한 것이 하나도 없다**(§11). 확인 불가 23건이 남았고, 그중 가장 큰 공백은 Menubar·Navigation Menu의 키보드·ARIA 명세 **전부** — [#127](https://github.com/flameware/massive-design/issues/127)이 두 컴포넌트를 계약할 때 딛고 선 땅이 정확히 거기다 — 그리고 `aria-haspopup`/`aria-expanded`/`aria-controls` 축인데, **이 축은 양쪽 다 문서에 속성 이름이 없어 실물 DOM으로만 확인된다.**

그 23건은 거의 전부 **"이행한다면 어떻게"**의 입력이지 **"이행할 것인가"**의 입력이 아니다. 그래서 판정 전에 요구하지 않는다. 대신 **재판정은 [#150](https://github.com/flameware/massive-design/issues/150) §10의 23건 실물 대조를 선행 조건으로 갖는다** — `@base-ui/react`를 실제로 설치해 대고 확인한다.

### 5. [#127](https://github.com/flameware/massive-design/issues/127)의 `asChild` 이름은 그대로 둔다

그 결정의 명시적 근거는 *"Base UI 어휘를 선취하지 않는다"*였고, 이행하지 않기로 판정한 이상 근거가 그대로 선다. 이름 재검토는 트리거가 아니라 **재판정의 딸린 항목**이다 — `asChild → render`는 prop 이름 변경일 뿐 아니라 값 어휘가 `boolean → 엘리먼트|함수`로 바뀌어 **호출 형태 자체가 달라지므로** breaking이다.

## 고려한 대안

- **지금 이행한다.** 이행 비용이 나중에 더 커진다는 전제 위에 서는데, [#150](https://github.com/flameware/massive-design/issues/150) §7.1이 그 전제를 뒷받침할 공개 근거를 찾지 못했다. 급하지 않다는 사실이 판정을 "일단 이행"으로 기울게 해서는 안 된다는 것이 맵 규칙 1이다.
- **이진 판정으로 닫는다.** 재논의 비용은 줄지만, 위 네 트리거는 실제로 일어날 수 있고 그때 근거가 사라진 채 판정만 남는다.
- **날짜 기반 재검토를 둔다.** 관리는 쉬우나 날짜는 아무것도 재지 않는다 — 규칙 2 위반.
- **판정 전에 prototype을 세운다.** [#150](https://github.com/flameware/massive-design/issues/150) §10의 22번(한 화면에서 두 라이브러리의 모달이 각자 스크롤 잠금·포커스 트랩을 걸 때의 동작)만이 점진 이행 가능 여부를 가르고, 그것이 이행 비용을 컴포넌트별이냐 24개 한 세대(breaking)냐로 바꾼다. 맵이 허용한 유일한 코드가 그 prototype이다. 그러나 판정이 머무름으로 가는 이상 **점진 가능 여부는 재판정 시점의 라이브러리 상태에 달렸지 오늘 측정값에 달려 있지 않다** — 지금 잰 값은 재판정 때 다시 재야 한다.
- **공존 미확인을 근거로 이행을 all-or-nothing 한 세대로 가정한다.** 이행 비용을 보수적으로 크게 잡는 쪽이라 판정 방향은 같지만, 확인되지 않은 것을 확인된 제약처럼 적게 되어 재판정의 출발점을 틀리게 만든다.
- **기존 24개의 이행 여부만 판정한다(§3의 (a)).** ADR이 작아지지만 새 컴포넌트가 Base UI로 조용히 들어올 길을 열어 두고, 기반의 갈라짐은 그렇게 사고로 일어난다.

## 파급

**코드는 바뀌지 않는다.** 해시도 Figma 기준선도 움직이지 않는다 — 맵 [#141](https://github.com/flameware/massive-design/issues/141)이 계획만 하기로 한 그대로다.

**[#140](https://github.com/flameware/massive-design/issues/140)이 이미 이행 비용을 줄여 놨고, 그 수는 재판정 때 다시 세야 한다.** [#150](https://github.com/flameware/massive-design/issues/150)은 매니페스트 해시가 primitive `data-*` 개명에 확정적으로 노출된 자리를 **여섯**(`checkbox`·`switch`·`toggle`·`menubar`·`navigation-menu`·`slider`)으로 셌다. 지금 커밋된 매니페스트에 대고 다시 세면 해시 입력에 남은 primitive 유래 수식자 키는 **둘**이다 — `switch`의 `[&_[data-slot=switch-thumb]]:data-[state=checked]:*` 4키(`#155` 대기 중인 그 4키/8셀)와 `combobox`의 `data-[placeholder=true]:color` 1키. 나머지 넷은 `#140`이 `MODIFIER_POLICY`에 수식자를 넣으면서 면역이 됐다(`dropdown-menu`의 `data-[inset=true]`는 **우리 prop**이라 애초에 무관하다). [#150](https://github.com/flameware/massive-design/issues/150)이 *"그 공백을 먼저 닫으면 여섯 중 여럿이 면역이 된다"*고 적어 둔 일이 실제로 일어났다 — 그래서 이 판정에 남은 비용은 해시가 아니라 **anatomy와 동작**이다.

**점진 이행 가능성은 미확인인 채로 열려 있다.** 확인된 것은 패키지 층위까지다 — 이름이 겹치지 않고 React peer 범위가 겹치며 **shadcn 자신이 `apps/v4/package.json`에서 둘을 동시에 의존한다.** 확인 못 한 것은 React context 충돌·번들 중복·두 모달의 스크롤 잠금과 포커스 트랩 중첩([#150](https://github.com/flameware/massive-design/issues/150) §10의 20–22)이고, 이 셋이 재판정의 실측 목록 맨 앞에 선다.

**Base UI에만 있는 primitive가 필요해지는 순간이 재판정 지점이다.** 확인된 자리가 하나 있다 — Base UI에는 별도 `Drawer`가 있고, [#97](https://github.com/flameware/massive-design/issues/97)이 Drawer를 Sheet에 대해 배제한 판정이 그 자리와 만난다.

**게이트는 이것을 보지 못한다.** 어떤 검사도 새 의존이 `radix-ui`가 아닌 기반에서 왔는지 판정하지 않는다. [ADR-0006](0006-uncontracted-surfaces.md)의 규칙 그대로, 이 문장을 참으로 유지하는 것은 의존을 들이는 사람의 몫이다.
