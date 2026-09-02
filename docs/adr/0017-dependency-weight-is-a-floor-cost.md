# 의존성의 무게는 라이브러리가 아니라 **바닥값**으로 잰다

[#118](https://github.com/flameware/massive-design/issues/118) 규칙 2가 서드파티 의존성을 *대가를 계약에 적는 조건으로* 허용했고, [#122](https://github.com/flameware/massive-design/issues/122)가 서드파티가 소유하는 **표면**의 경계를 그었다. 남은 것이 서드파티가 끌고 오는 **무게**의 경계다. [#125](https://github.com/flameware/massive-design/issues/125)가 *"차트 본체가 소비처 것이면 `recharts`도 소비처 것 아닌가"* 를 소유자 결정이라 넘겼고, [#151](https://github.com/flameware/massive-design/issues/151)이 실측한 뒤 [#153](https://github.com/flameware/massive-design/issues/153)이 판정한다.

**질문의 전제가 실측에서 무너졌다.** 전이 설치는 76개가 아니라 43개(peer 제외 37)였고 — 더 중요하게 — **설치 수와 실제 무게가 거의 무관했다.** 같은 `recharts`가 `ResponsiveContainer` 하나만 쓰면 8,371 B이고 d3·redux·immer·victory-vendor가 전부 shake out되는 반면, Storybook 스토리가 차트 본체를 import하는 경로에서는 407,702 B에 모듈 371개다. **하나의 라이브러리에 두 자릿수 차이의 두 수가 있다.**

그리고 진짜로 새고 있던 자리는 의존성 선택이 아니라 **패키징**이었다: `sideEffects`를 선언하지 않은 `input-otp`와 `react-resizable-panels` 때문에, `@massive/ui`에서 **`cn` 하나만 import해도 — 컴포넌트 0개에 — 172,701 B**가 나오고 그 안에 두 라이브러리가 통째로 들어 있다.

## 결정

### 1. 관문이 재는 것은 **바닥값**이다 — 소비처가 아무것도 안 썼는데 무는 바이트

**바닥값(floor cost)** 은 소비처가 `@massive/ui`에서 컴포넌트를 하나도 쓰지 않을 때 무는 바이트다. 관문은 이것만 본다. 라이브러리를 심사하지 않고, 설치 수를 세지 않고, "쓰는 표면 대 끌고 온 것"의 비도 재지 않는다.

라이브러리 단위로 심사하지 않는 이유는 **잴 수 있는 수가 없기 때문**이다. 위의 8,371 B와 407,702 B는 둘 다 참이고 어느 쪽도 "`recharts`의 무게"가 아니다 — 무게는 라이브러리가 아니라 **소비처의 import**에 있다. 라이브러리에 하나의 수를 붙이는 관문은 [ADR-0006](0006-uncontracted-surfaces.md)이 금지한 모양이다: 게이트가 볼 수 없는 것을 주장한다.

바닥값은 그 반대다. 소비처의 선택과 무관한 **단일한 수**이고, 재현 가능하며([#151](https://github.com/flameware/massive-design/issues/151)이 측정 도구를 함께 커밋했다), 무엇보다 **지금 실제로 깨져 있는 것이 정확히 그것**이다.

### 2. 따라서 `recharts`는 정책 문제가 아니고, [#125](https://github.com/flameware/massive-design/issues/125)는 되돌리지 않는다

`recharts`는 바닥값에 **1바이트도 얹지 않는다** — `sideEffects: false`를 선언하고 깨끗하게 shake된다. 이 관문에 걸리는 것은 `recharts`가 아니라 `input-otp`와 `react-resizable-panels`이고, 그 둘은 `#125`의 축소 구현과 아무 관계가 없다. **원래 질문("차트 본체가 소비처 것이면 recharts도 소비처 것 아닌가")은 답이 아니라 전제가 틀린 것으로 닫힌다.**

**그리고 [#125](https://github.com/flameware/massive-design/issues/125)가 소비처로 옮긴 무게는 관문 밖에 있다 — 구성상 그렇다.** 바닥값의 정의가 *소비처가 요청하지 않은 것*이므로, 소비처가 `BarChart`를 스스로 import해서 무는 407,702 B는 이 관문이 볼 자리가 아니다. 옮긴 무게를 누가 판단하는가에 대한 답은 **소비처**이며, 우리가 지는 것은 그 선택이 가능하도록 축소 구현이 본체를 강제하지 않는 것까지다.

### 3. 관문을 못 넘으면 **우리 쪽부터 고친다** — 걷어내기는 배제한다

우선순위가 있는 세 갈래다.

1. **우리 패키지의 선언을 고친다.** `@massive/ui`는 지금 `sideEffects`를 **선언하지 않는다** — 남을 탓하기 전에 우리가 같은 상태다. `"sideEffects": ["*.css"]`가 정확한 선언이다(`src/`의 어떤 `.ts`/`.tsx`도 CSS를 import하지 않고 `styles.css`는 `exports` 경로로만 나간다).
2. **그래도 새면 진입점을 가른다.** 소비처가 `cn` 때문에 캐러셀을 물지 않도록.
3. **그래도 남으면 대가를 적고 받아들인다** — [#118](https://github.com/flameware/massive-design/issues/118) 규칙 2의 지금 답 그대로.

**직접 구현으로 걷어내는 것은 배제한다.** 원인이 우리 패키지의 미선언일 가능성이 남아 있는데 라이브러리부터 걷어내는 것은 순서가 거꾸로이고, [ADR-0016](0016-primitive-base-stays-radix.md)이 방금 세운 입증 책임의 모양과도 충돌한다 — 직접 구현 쪽이 접근성 동작의 값을 지고 오는데 [#151](https://github.com/flameware/massive-design/issues/151)이 **"줄 수는 접근성 동작의 값을 매기지 못한다"** 고 명시했다(`react-resizable-panels` 2,259줄, `input-otp`는 minified 배포라 줄 수조차 못 쟀다).

### 4. 규칙은 지금 서고, **자동 검사는 아직 세우지 않는다**

바닥값은 사람이 눈으로 볼 수 있는 종류가 아니라 **재야만 보이는** 종류다 — 43세대를 통과한 `DropdownMenuSeparator`([ADR-0006](0006-uncontracted-surfaces.md))과 같은 모양이고, 사람 확인표에 *"172KB인지 봐라"* 를 적는 것은 지켜지지 않는다. 그러므로 최종 형태는 검사다.

그런데 **지금 세우면 안 된다.** [#151](https://github.com/flameware/massive-design/issues/151) §9가 재지 못한 것 중에 *"Vite/Rollup/webpack이 `sideEffects` 미선언 패키지에 대해 bun 1.3.8과 같은 판단을 하는지"* 가 있다. 즉 **우리 수가 소비처의 수라는 보장이 아직 없고**, 그 상태로 기준선을 커밋하면 소비처에서 재현되지 않는 수를 관문의 정본으로 삼게 된다 — [ADR-0006](0006-uncontracted-surfaces.md)이 경계한 바로 그 침묵을 게이트 자신이 만든다.

**규칙은 이 ADR로 지금 선다. 검사는 번들러 대조가 끝난 뒤 별도 effort에서 세운다.** 그때까지 바닥값은 [#151](https://github.com/flameware/massive-design/issues/151)이 커밋한 도구(`docs/research/dependency-weight/*.mjs`, `packages/ui/bundle-probe/`)로 손으로 잰다.

### 5. peer는 워크스페이스가 선언한다 — `react-is`의 침묵은 정책 공백이다

`react-is`는 `recharts`의 peer인데 **어느 워크스페이스 패키지도 선언하지 않고**, 실제로는 `storybook → @testing-library/dom → pretty-format@27.5.1`로 우연히 들어와 있다. 그리고 하중을 진다 — 그 항목을 가리면 `ResponsiveContainer`만 쓰는 빌드조차 실패한다(`recharts`에 `exports` 필드가 없어 배럴의 570개 모듈이 shake 전에 전부 resolve돼야 한다).

**모든 검사가 통과한 이유가 "옳아서"가 아니라 "dev 의존성이 우연히 메워서"이고, 그 우연은 리포 밖에서 재현되지 않는다.** [#122](https://github.com/flameware/massive-design/issues/122)가 이름 붙인 *"없는 것은 통과가 아니라 침묵이다"* 의 의존성판이다. 따라서 **런타임에 필요한 peer는 그것을 쓰는 워크스페이스 패키지가 직접 선언한다** — `@massive/ui`가 `react-is`를 선언한다.

### 6. 재현성의 정본은 `bun.lock`이다 — `package.json`의 표기는 **의도 선언**이다

넷은 정확히 고정, `radix-ui`만 범위(`^1.6.7`)인 상태에 이유가 적혀 있지 않았다. 그리고 [#151](https://github.com/flameware/massive-design/issues/151)이 그 고정의 효력이 **한 단계 아래에서 뒤집힌다**는 것을 보였다 — 정확히 고정한 `recharts`가 자기 의존 11개 중 10개를 열어 두고(`@reduxjs/toolkit`·`react-redux`는 메이저 두 개에 걸쳐), 범위로 둔 `radix-ui`는 자기 의존 55개를 전부 정확히 고정한다.

그러므로 **"정확히 고정하면 안전하다"는 성립하지 않는다.** 재현성은 `bun.lock`이 지고, `package.json`의 범위/고정은 다른 것을 뜻하도록 재정의한다: **이 라이브러리의 마이너 업데이트를 우리가 스스로 받을 의사가 있는가.**

그러면 지금 상태가 우연이 아니라 [ADR-0016](0016-primitive-base-stays-radix.md)의 직접 귀결이 된다 — **`radix-ui`는 primitive 기반이니 따라간다(범위). 나머지 넷은 대가를 적고 들어온 것이니 따라가지 않는다(고정).**

## 고려한 대안

- **라이브러리 심사 관문을 둔다** — 새 의존성의 무게를 재서 문턱으로 거른다. #118 규칙 2에 수를 더하는 가장 자연스러운 모양이지만, 라이브러리에 붙일 하나의 수가 존재하지 않는다(8,371 vs 407,702). 문턱을 정하려면 "어느 import 경로를 기준으로 하는가"를 먼저 정해야 하는데 그건 소비처가 정한다.
- **설치 수를 센다** — 가장 싸고 이미 재 놓은 수다. 그러나 실측이 설치 수와 무게가 거의 무관함을 보였다(`input-otp`·`react-resizable-panels`는 **이것에만 딸린 것이 0개**인데 바닥값 오염의 원인이고, `recharts`는 37개인데 0바이트다). **설치 수는 정확히 반대 방향을 가리켰을 수도 있었다.**
- **선언 규칙만 두고 검사는 영영 두지 않는다** — `behaviors`([ADR-0010](0010-behaviors-are-declared-and-human-verified.md))와 같은 등급으로 취급한다. 그러나 그 등급의 정의는 *파생 채널이 나르지 않아 사람만 판정할 수 있다*는 것인데, 바닥값은 기계가 정확히 잴 수 있다. 사람에게 맡기는 것은 등급이 아니라 포기다.
- **지금 자동 검사를 세운다** — 결함이 재야만 보이는 종류이므로 방향은 맞다. 그러나 소비처 번들러에서 재현된다는 보장 없이 기준선을 커밋하게 된다. 순서를 뒤집는 대가가 결정을 미루는 대가보다 크다.
- **`input-otp`·`react-resizable-panels`를 걷어낸다** — 오염의 원인을 제거하는 가장 직접적인 길이고, 실제로 이 둘이 유일한 위반자다. 그러나 우리 자신의 `sideEffects` 미선언을 고쳐 보기 전에 내리는 판정이라 원인 규명이 끝나지 않았고, 접근성 동작을 줄 수로 값 매기는 셈이 된다.
- **peer를 지금대로 둔다** — 설치돼 있고 검사도 통과한다. 그러나 통과의 원인이 `storybook`이다. 리포 밖 소비처가 `react-is`를 어떻게 얻는지는 [#151](https://github.com/flameware/massive-design/issues/151) §9가 재지 못한 8건 중 하나로 남아 있다.

## 파급

**코드는 바뀌지 않는다.** 맵 [#141](https://github.com/flameware/massive-design/issues/141)이 계획만 하기로 한 그대로다. 이 ADR이 요구하는 세 가지 — `@massive/ui`의 `"sideEffects": ["*.css"]` 선언, `react-is` 선언 추가, 바닥값 재측정 — 은 전부 **별도 effort의 charting 지점**이며 이 맵 밖이다.

**게이트는 아직 이것을 보지 못한다.** §4가 검사를 미룬 결과이며, 그동안 이 ADR의 문장이 참인지는 의존성을 들이는 사람이 손으로 잰다. [ADR-0006](0006-uncontracted-surfaces.md)의 규칙이 그대로 적용된다 — **다만 여기서는 "볼 수 없다"가 아니라 "아직 안 본다"이고, 그 차이가 후속 effort를 만든다.**

**`limits`가 아니라 ADR이 이 판정의 자리다.** 무게는 컴포넌트 하나의 표면 결정이 아니라 패키지 전체의 성질이라 계약에 앉을 자리가 없다. [#118](https://github.com/flameware/massive-design/issues/118) 규칙 2의 *"대가를 계약에 적는다"* 는 여전히 컴포넌트 층위에서 유효하고, 이 ADR은 그 위에 **패키지 층위의 바닥값**을 더한다.

**소급 적용은 무언가를 되돌리는 일이 아니다.** 이미 들어온 넷 중 관문에 걸리는 것은 둘이고, 그 둘의 처방은 §3의 1번(우리 패키지의 선언)이라 **컴포넌트도 계약도 매니페스트 해시도 움직이지 않는다.** 51개 세대가 통과한 것을 다시 열지 않는다.

**[#151](https://github.com/flameware/massive-design/issues/151)의 측정 도구가 이 판정의 인프라가 된다.** `research/dependency-weight` 브랜치에만 있는 그 도구들이 §4의 손 측정이 딛는 땅이므로, 검사를 세우는 effort는 그것을 `main`으로 들이는 일부터 시작한다.
