# 서드파티 의존성의 설치 그래프와 실제 사용 표면 실측

- 티켓: [#151](https://github.com/flameware/massive-design/issues/151) (맵 [#141](https://github.com/flameware/massive-design/issues/141))
- 조사일: 2026-09-01
- 조사 대상: `radix-ui@1.6.7`, `embla-carousel-react@8.6.0`, `recharts@3.10.1`, `input-otp@1.5.0`, `react-resizable-panels@4.12.3`
- 측정 환경: bun 1.3.8, `bun install --frozen-lockfile`로 만든 깨끗한 트리, macOS(darwin 25.6.0)
- 범위: **사실만 모은다. 판정하지 않는다.** 걷어낼지 남길지는 [#153](https://github.com/flameware/massive-design/issues/153)의 일이다.
- 출처 원칙: 요약글이 아니라 **설치된 패키지의 `package.json`·`dist`·`bun.lock`과 우리 소스**를 직접 읽고, 번들은 실제로 빌드해서 바이트를 셌다. 모든 숫자에 재현 명령을 붙였다. **재현하지 못한 것은 재현하지 못했다고 적었다.**

---

## 0. 한 줄 결론 — 이 조사가 세운 사실 다섯

1. **끌고 오는 양과 번들에 실리는 양은 완전히 다른 축이다.** `recharts`는 설치 43개를 끌고 오지만 우리가 쓰는 `ResponsiveContainer` 하나만 담으면 소비처 번들에 **8,371 B(gzip 3,648 B)**만 더한다. 11개 직접 의존 중 번들에 도달하는 것은 `clsx`와 `es-toolkit` 세 모듈뿐이고 d3·redux·immer는 **전부 떨어져 나간다.**
2. **그런데 tree-shaking이 되지 않는 둘이 있다.** `input-otp`와 `react-resizable-panels`는 `package.json`에 `sideEffects`를 선언하지 않는다. 그래서 `@massive/ui`에서 **`cn` 하나만 가져와도** 두 라이브러리가 통째로 번들에 들어온다. 나머지 셋(`radix-ui`·`embla-carousel-react`·`recharts`)은 `sideEffects: false`를 선언하고 실제로 잘 털린다.
3. **`react-is`는 설치되어 있다 — [#125](https://github.com/flameware/massive-design/issues/125)의 관찰을 반증한다.** 다만 `recharts`의 몫으로 들어온 것이 아니라 `storybook → @testing-library/dom → pretty-format@27 → react-is@17.0.2`라는 **개발 도구 사슬의 부산물**로 들어왔다. 그리고 이것은 장식이 아니다: `react-is` 저장소 항목을 감추면 `ResponsiveContainer` 하나만 담는 빌드조차 **실패한다**(§5.2).
4. **우리가 쓰는 표면의 비는 라이브러리마다 두 자릿수로 갈린다.** `recharts` **1/101**, `react-resizable-panels` 3/9, `input-otp` 2/5, `embla-carousel-react` API **6/22**, `radix-ui` 네임스페이스 **25/35**·런타임 part **124/182**.
5. **버전 정책은 넷이 정확 고정, `radix-ui`만 범위(`^1.6.7`)다.** 그러나 실질 위험은 반대다 — `radix-ui`는 55개 하위 의존을 **전부 정확히 고정**하고, 정확히 고정된 `recharts`는 11개 중 **10개를 범위로 열어 둔다**.

---

## 1. 설치 그래프

### 1.1 재현

```sh
bun install --frozen-lockfile
node docs/research/dependency-weight/pkg-meta.mjs radix-ui embla-carousel-react recharts input-otp react-resizable-panels
node docs/research/dependency-weight/install-graph.mjs radix-ui embla-carousel-react recharts input-otp react-resizable-panels
node docs/research/dependency-weight/exclusive-install.mjs
node docs/research/dependency-weight/lock-closure.mjs
```

`install-graph.mjs`는 bun의 isolated 링커가 만든 `node_modules/.bun/<name>@<version>+<hash>/node_modules/` 심링크 그래프를 BFS로 따라간다. `lock-closure.mjs`는 같은 계산을 `bun.lock`만 읽고 독립적으로 다시 한다. **두 방법이 같은 수를 낸다.**

### 1.2 결과

| 의존성 | 직접 의존(`dependencies`) | 전이 설치(peer 포함) | peer 제외 | 이 의존성에만 딸린 것 |
|---|---:|---:|---:|---:|
| `radix-ui@1.6.7` | 55 | **79** | 73 | **74** |
| `embla-carousel-react@8.6.0` | 2 | **3** | 2 | **2** |
| `recharts@3.10.1` | 11 | **43** | 37 | **37** |
| `input-otp@1.5.0` | 0 | **3** | 0 | **0** |
| `react-resizable-panels@4.12.3` | 0 | **3** | 0 | **0** |

- "전이 설치(peer 포함)"는 `react`·`react-dom`·`scheduler`·`@types/react`처럼 **우리가 어차피 갖는 것**을 포함한 수다. `input-otp`·`react-resizable-panels`의 3은 전부 그것이라 실질은 0이다.
- "이 의존성에만 딸린 것"은 나머지 네 라이브러리와 `@massive/ui`의 다른 직접 의존(`react`·`react-dom`·`cva`·`clsx`·`tailwind-merge`) 클로저를 모두 뺀 나머지다. **걷어냈을 때 실제로 사라지는 패키지 수**에 해당한다.
- `recharts`의 37개 중 d3 계열이 **22개**(`victory-vendor` 경유 `d3-*` 11개 + `@types/d3-*` 9개 + `internmap` + `victory-vendor` 자신), redux 계열이 **5개**(`@reduxjs/toolkit`·`redux`·`redux-thunk`·`react-redux`·`reselect`)다.
- `radix-ui`의 74개 중 `@radix-ui/*` 스코프가 **60개**, `@floating-ui/*`가 4개, 나머지 10개는 `react-remove-scroll` 계열(`react-remove-scroll`·`react-remove-scroll-bar`·`react-style-singleton`·`use-sidecar`·`use-callback-ref`·`aria-hidden`·`get-nonce`·`detect-node-es`)과 `tslib`·`@types/react-dom`이다.

### 1.3 [#125](https://github.com/flameware/massive-design/issues/125)의 "설치 76개"는 재현하지 못했다

두 방법(심링크 그래프, `bun.lock` 클로저)이 독립적으로 **43(peer 포함) / 37(peer 제외)**을 낸다. 76은 어느 쪽으로도 나오지 않았고, #125가 어떤 세는 법을 썼는지 티켓 본문에 남아 있지 않아 **차이의 원인을 확인하지 못했다.** 직접 의존 11개는 정확히 일치한다.

---

## 2. 우리가 실제로 쓰는 표면

### 2.1 재현

```sh
# 다섯 라이브러리의 import 전수
grep -rn "from ['\"]\(radix-ui\|embla-carousel-react\|recharts\|input-otp\|react-resizable-panels\)" packages/ui/src

# radix-ui: 네임스페이스별 사용 part 대 라이브러리가 내는 런타임 part
node docs/research/dependency-weight/radix-surface.mjs

# 나머지 넷의 멤버 사용
grep -o "RechartsPrimitive\.[A-Za-z]*"  packages/ui/src/components/ui/chart.tsx     | sort -u
grep -o "ResizablePrimitive\.[A-Za-z]*" packages/ui/src/components/ui/resizable.tsx | sort -u
grep -n  "api\.[a-zA-Z]*\|useEmblaCarousel" packages/ui/src/components/ui/carousel.tsx
grep -n  "OTPInput\|OTPInputContext"    packages/ui/src/components/ui/input-otp.tsx
```

`packages/ui/src` 전체에서 이 다섯 라이브러리를 가져오는 줄은 **30줄, 30개 파일**이다. 그중 26줄이 `radix-ui`다.

### 2.2 요약 — "끌고 온 것" 대 "쓰는 것"

| 의존성 | 우리가 쓰는 것 | 라이브러리가 내는 것 | 비 |
|---|---|---:|---|
| `radix-ui` | 네임스페이스 25개 | 35개 | **25/35** |
| `radix-ui` (part 단위) | 124 | 182 | **124/182** |
| `embla-carousel-react` | 기본 export `useEmblaCarousel` + 타입 1개 | export 3개 | **1/1 값** |
| `embla-carousel` API | `on` `off` `scrollNext` `scrollPrev` `canScrollNext` `canScrollPrev` | `EmblaCarouselType` 멤버 22개 | **6/22** |
| `recharts` | `ResponsiveContainer` | 런타임 export 101개 | **1/101** |
| `input-otp` | `OTPInput`, `OTPInputContext`(→ `context.slots[i]`) | 런타임 export 5개 | **2/5** |
| `react-resizable-panels` | `Group`, `Panel`, `Separator` | 런타임 export 9개 | **3/9** |

`radix-ui`의 분모 "런타임 part 182"는 각 leaf `dist/index.d.mts`의 값 export에서 타입(`*Props`)·긴 별칭(`AccordionItem`은 `Item`과 같은 것)·`create*Scope`를 뺀 수다. 원시 export 이름을 그대로 세면 521개지만 그 수는 같은 컴포넌트를 두세 번 세므로 쓰지 않았다.

### 2.3 `radix-ui` 네임스페이스별 상세

| 네임스페이스 | leaf 패키지 | 사용 | 런타임 part | 안 쓰는 part |
|---|---|---:|---:|---|
| Accordion | `@radix-ui/react-accordion` | 5 | 5 | — |
| AlertDialog | `@radix-ui/react-alert-dialog` | 9 | 9 | — |
| Avatar | `@radix-ui/react-avatar` | 3 | 3 | — |
| Checkbox | `@radix-ui/react-checkbox` | 2 | 8 | `unstable_*` 6 |
| Collapsible | `@radix-ui/react-collapsible` | 3 | 3 | — |
| ContextMenu | `@radix-ui/react-context-menu` | 8 | 16 | Arrow CheckboxItem ItemIndicator RadioGroup RadioItem Sub SubContent SubTrigger |
| Dialog | `@radix-ui/react-dialog` | 8 | 9 | WarningProvider |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | 8 | 16 | Arrow CheckboxItem ItemIndicator RadioGroup RadioItem Sub SubContent SubTrigger |
| Label | `@radix-ui/react-label` | 1 | 1 | — |
| Menubar | `@radix-ui/react-menubar` | 16 | 17 | Arrow |
| NavigationMenu | `@radix-ui/react-navigation-menu` | 6 | 9 | Indicator Sub Viewport |
| Popover | `@radix-ui/react-popover` | 5 | 7 | Arrow Close |
| Progress | `@radix-ui/react-progress` | 2 | 2 | — |
| RadioGroup | `@radix-ui/react-radio-group` | 3 | 9 | `unstable_*` 6 |
| ScrollArea | `@radix-ui/react-scroll-area` | 5 | 5 | — |
| Select | `@radix-ui/react-select` | 13 | 20 | Arrow ScrollDownButton ScrollUpButton + `unstable_*` 4 |
| Separator | `@radix-ui/react-separator` | 1 | 1 | — |
| Slider | `@radix-ui/react-slider` | 4 | 10 | `unstable_*` 6 |
| Slot | `@radix-ui/react-slot` | 1 | 4 | Slottable createSlot createSlottable |
| Switch | `@radix-ui/react-switch` | 2 | 8 | `unstable_*` 6 |
| Tabs | `@radix-ui/react-tabs` | 4 | 4 | — |
| Toast | `@radix-ui/react-toast` | 7 | 7 | — |
| Toggle | `@radix-ui/react-toggle` | 1 | 1 | — |
| ToggleGroup | `@radix-ui/react-toggle-group` | 2 | 2 | — |
| Tooltip | `@radix-ui/react-tooltip` | 5 | 6 | Arrow |

아예 안 쓰는 네임스페이스 **10개**: `AccessibleIcon` `AspectRatio` `Direction` `Form` `HoverCard` `Portal` `Toolbar` `VisuallyHidden` `unstable_OneTimePasswordField` `unstable_PasswordToggleField`.

> `unstable_OneTimePasswordField`와 `unstable_PasswordToggleField`는 **우리가 `input-otp`로 따로 채운 자리와 겹친다.** 이 조사는 그 둘이 우리 계약을 대신할 수 있는지 판단하지 않는다 — 표면 대조와 접근성 동작 비교가 필요하고 그건 이 티켓 밖이다. **미측정.**

`radix-ui`를 가져오는 파일은 51개 중 **26개**다. 그중 `button.tsx`와 `breadcrumb.tsx` 둘은 `Slot`만 쓴다 — 맵이 세어 둔 "primitive 기반 24개"와 26의 차이가 이 둘이다.

### 2.4 나머지 넷의 사용 지점

- **`recharts`** — `chart.tsx` 한 곳. `import * as RechartsPrimitive from "recharts"` 뒤 실제 접근은 `RechartsPrimitive.ResponsiveContainer` **한 줄**뿐이다. 소비처(스토리)는 `Bar`·`BarChart`·`CartesianGrid`·`Legend`·`Tooltip`·`XAxis`를 recharts에서 **직접** 가져온다(#125의 재수출 포기 판정). `apps/storybook/package.json`도 `recharts@3.10.1`을 직접 선언한다.
- **`embla-carousel-react`** — `carousel.tsx` 한 곳. 기본 export와 `UseEmblaCarouselType` 타입. Embla 인스턴스 API 22개 중 6개(`on`/`off`/`scrollNext`/`scrollPrev`/`canScrollNext`/`canScrollPrev`)를 쓰고, 옵션은 `axis` 하나만 우리가 정하며 나머지는 소비처가 통과시킨다.
- **`input-otp`** — `input-otp.tsx` 한 곳. `OTPInput`과 `OTPInputContext`(→ `context?.slots?.[index]`). `REGEXP_ONLY_*` 세 상수는 안 쓴다.
- **`react-resizable-panels`** — `resizable.tsx` 한 곳. `Group`·`Panel`·`Separator`. 명령형 핸들 훅 4개(`useGroupRef` 등)와 `isCoarsePointer`·`useDefaultLayout`은 안 쓴다.

---

## 3. 번들 기여와 tree-shaking

### 3.1 재현

```sh
bun install --frozen-lockfile
sh packages/ui/bundle-probe/measure.sh      # 프로브별 raw/gzip 바이트
sh packages/ui/bundle-probe/scan.sh         # 각 번들에 어떤 라이브러리가 살아남았는지
sh packages/ui/bundle-probe/radix-each.sh   # radix 네임스페이스 25개 각각의 비용
sh packages/ui/bundle-probe/modules.sh ui-cn   # 소스맵 sources로 살아남은 모듈 집계
```

프로브 진입점은 `packages/ui/bundle-probe/*.tsx`이고, 각각 **소비처가 실제로 쓰는 import 문**을 그대로 옮긴 것이다. 빌드는 `bun build --minify --target=browser --format=esm`이며 `react`·`react-dom`·`react/jsx-runtime`은 소비처가 이미 갖고 있으므로 external로 뺐다. gzip은 `gzip -9`.

### 3.2 라이브러리 단독 비용

| 프로브 | 무엇을 담나 | raw | gzip |
|---|---|---:|---:|
| `baseline` | `react`만(external) — 측정 바닥 | 56 B | 85 B |
| `radix-one` | `Slot` 하나 | 3,252 B | 1,460 B |
| `radix-used` | 우리가 쓰는 네임스페이스 25개 | **229,075 B** | **69,747 B** |
| `radix-all` | `import * as R from "radix-ui"` (35개 전부) | 258,587 B | 79,115 B |
| `embla` | `useEmblaCarousel` | **20,126 B** | **8,256 B** |
| `recharts-used` | `ResponsiveContainer`만 | **8,371 B** | **3,648 B** |
| `recharts-story` | 소비처 스토리가 쓰는 6개(`Bar`·`BarChart`·`CartesianGrid`·`Legend`·`Tooltip`·`XAxis`) | **407,702 B** | **119,718 B** |
| `recharts-all` | `import * as R from "recharts"` | 622,899 B | 171,186 B |
| `inputotp` | `OTPInput` + `OTPInputContext` | **10,022 B** | **4,101 B** |
| `rrp` | `Group`·`Panel`·`Separator` | **32,743 B** | **11,233 B** |

**tree-shaking은 다섯 중 셋에서 작동한다.**

- `recharts`: 진입점이 barrel(`es6/index.js`, `exports` 필드 없음)이라 번들러는 **570개 모듈을 읽고 시작**하지만, `ResponsiveContainer`만 쓰면 최종 산출물에 남는 모듈은 **10개**다(`recharts` 5 + `es-toolkit` 3 + `clsx` 1 + 우리 1). d3·redux·immer·`eventemitter3`·`decimal.js-light`·`victory-vendor`는 **한 바이트도 남지 않는다.** 문자열 검색으로도 확인: `recharts-used.js`에 `react-is`·`victory`·`d3-`·`redux`·`immer`·`es-toolkit`·`eventemitter3`·`decimal` 어느 것도 나타나지 않는다.
- `radix-ui`: 네임스페이스 단위로 정확히 털린다. `Slot` 하나만 쓰면 3,252 B다.
- `embla-carousel-react`: 20 KB 전체가 곧 최소 단위다(엔진이 통짜다).

**작동하지 않는 둘**은 §3.4에서 원인까지 짚는다.

### 3.3 `radix-ui` 네임스페이스별 비용

`sh packages/ui/bundle-probe/radix-each.sh`

| 네임스페이스 | raw | gzip | | 네임스페이스 | raw | gzip |
|---|---:|---:|---|---|---:|---:|
| Slot | 3,247 | 1,452 | | Slider | 27,606 | 9,954 |
| Label | 4,140 | 1,847 | | RadioGroup | 30,556 | 10,562 |
| Separator | 4,264 | 1,902 | | Toast | 37,364 | 12,308 |
| Progress | 7,450 | 3,009 | | NavigationMenu | 40,038 | 13,058 |
| Toggle | 7,874 | 3,168 | | Dialog | 41,065 | 14,001 |
| Avatar | 8,192 | 3,297 | | AlertDialog | 42,838 | 14,396 |
| Switch | 13,399 | 5,085 | | Tooltip | 55,181 | 19,530 |
| Collapsible | 14,609 | 5,273 | | Popover | 69,307 | 24,498 |
| Checkbox | 16,538 | 6,036 | | Select | 92,306 | 31,862 |
| ScrollArea | 23,026 | 7,478 | | DropdownMenu | 94,929 | 31,907 |
| ToggleGroup | 24,335 | 8,594 | | ContextMenu | 95,546 | 32,232 |
| Accordion | 26,103 | 8,963 | | Menubar | 96,620 | 32,506 |
| Tabs | 26,735 | 9,363 | | | | |

메뉴 계열 셋(`ContextMenu`·`DropdownMenu`·`Menubar`)과 `Select`가 각각 90 KB대이고, 넷은 `@radix-ui/react-menu`·`react-popper`·`@floating-ui/*`·`react-remove-scroll`을 공유하므로 **합산이 아니라 겹친다** — 25개를 따로 재서 더하면 903,268 B이지만 한 번들에 함께 담으면 229,075 B다.

### 3.4 `@massive/ui`를 통과했을 때 — barrel이 새는 자리

| 프로브 | 소비처가 쓴 import | raw | gzip |
|---|---|---:|---:|
| `ui-cn` | `import { cn }` — **컴포넌트를 하나도 안 쓴다** | **172,701 B** | **55,770 B** |
| `ui-button` | `import { Button }` | 173,085 B | 55,908 B |
| `ui-resizable` | `import { ResizablePanelGroup }` | 172,984 B | 55,850 B |
| `ui-inputotp` | `import { InputOTP }` | 172,923 B | 55,862 B |
| `ui-chart` | `import { ChartContainer }` | 181,422 B | 59,496 B |
| `ui-carousel` | `import { Carousel }` | 194,027 B | 64,820 B |
| `ui-all` | `import * as UI` | 468,611 B | 142,013 B |

**바닥이 172,701 B(gzip 55,770 B)다.** `cn` 하나만 가져와도 여기까지 온다. 소스맵의 `sources`로 무엇이 살아남았는지 세면(`sh packages/ui/bundle-probe/modules.sh ui-cn`) 73개 모듈:

```
  52  (@massive/ui source)      ← barrel이 51개 컴포넌트 모듈을 전부 끌고 온다
  16  @radix-ui/*               ← react-toast 및 그 하위(presence, portal, dismissable-layer, collection …)
   1  input-otp
   1  react-resizable-panels
   3  clsx / class-variance-authority / tailwind-merge
```

원인은 `package.json`의 `sideEffects` 선언이다:

```sh
node -e 'for (const p of ["radix-ui","embla-carousel-react","recharts","input-otp","react-resizable-panels"]) \
  console.log(p, JSON.stringify(require(`./packages/ui/node_modules/${p}/package.json`).sideEffects))'
```

| 패키지 | `sideEffects` | barrel 경유 tree-shaking |
|---|---|---|
| `radix-ui` | `false` | 된다 |
| `embla-carousel-react` | `false` | 된다 |
| `recharts` | `false` | 된다 |
| `input-otp` | **선언 없음** | **안 된다 — 항상 실린다** |
| `react-resizable-panels` | **선언 없음** | **안 된다 — 항상 실린다** |

즉 `input-otp`(10,022 B)와 `react-resizable-panels`(32,743 B), 합쳐 **42,765 B raw**는 소비처가 그 컴포넌트를 쓰든 안 쓰든 들어간다. `@massive/ui` 자신도 `package.json`에 `sideEffects`를 선언하지 않아 barrel 51개 모듈이 통째로 유지되고, 그것이 나머지 바닥을 만든다.

> **미측정 하나.** `@radix-ui/react-toast`는 `sideEffects: false`를 선언하는데도 `ui-cn`에 남는다. `dist/index.mjs`에 최상위 부수효과 문장은 보이지 않았고, bun의 tree-shaker가 왜 이것만 남기는지 **원인을 확인하지 못했다.** 다른 24개 네임스페이스는 정상적으로 떨어진다.
>
> **또 하나.** 위 숫자는 전부 **bun 1.3.8의 번들러** 기준이다. Vite/Rollup·webpack·esbuild가 같은 결론을 내는지는 측정하지 않았다. 특히 `sideEffects` 미선언에 대한 처리는 번들러마다 다를 수 있다.

---

## 4. 사실 확인 — [#125](https://github.com/flameware/massive-design/issues/125)가 "`ResponsiveContainer` 하나"라고 한 것의 값

`chart.tsx`가 recharts에서 실제로 쓰는 `ResponsiveContainer`는 **ResizeObserver 래퍼**다.

```sh
grep -n "ResizeObserver" packages/ui/node_modules/recharts/es6/component/ResponsiveContainer.js
wc -l packages/ui/node_modules/recharts/es6/component/ResponsiveContainer.js   # 225
```

의존은 `clsx`, `react`, `es-toolkit/compat/throttle`, 그리고 recharts 내부 유틸 넷이다. 번들 기여 8,371 B(gzip 3,648 B), 모듈 10개.

반면 **소비처 경로는 전혀 다른 무게다.** `apps/storybook/stories/CatalogReference.tsx`가 recharts에서 직접 가져오는 6개는 **407,702 B(gzip 119,718 B), 모듈 371개**이고 여기에는 d3 계열 111개 모듈, redux 계열, `react-is`가 전부 들어 있다. **`@massive/ui`가 지는 recharts 비용과 소비처가 지는 recharts 비용은 두 자릿수 차이가 난다** — 판정할 때 이 둘을 섞지 않아야 한다.

---

## 5. peer dependency 선언과 실제 설치

### 5.1 대조

```sh
node docs/research/dependency-weight/peers.mjs radix-ui embla-carousel-react recharts input-otp react-resizable-panels
```

| 패키지 | 선언한 peer | 요구 범위 | 실제 해석 | 만족? |
|---|---|---|---|---|
| `radix-ui` | `react` | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 19.2.8 | ✅ |
| | `react-dom` | 같음 | 19.2.8 | ✅ |
| | `@types/react` (optional) | `*` | 19.2.18 | ✅ |
| | `@types/react-dom` (optional) | `*` | 19.2.4 | ✅ |
| `embla-carousel-react` | `react` | `^16.8 \|\| ^17.0.1 \|\| ^18 \|\| ^19` | 19.2.8 | ✅ |
| `recharts` | `react` | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 19.2.8 | ✅ |
| | `react-dom` | `^16 \|\| ^17 \|\| ^18 \|\| ^19` | 19.2.8 | ✅ |
| | **`react-is`** | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | **17.0.2** | ✅ (아래 참조) |
| `input-otp` | `react`, `react-dom` | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 19.2.8 | ✅ |
| `react-resizable-panels` | `react`, `react-dom` | `^18 \|\| ^19` | 19.2.8 | ✅ |

**미충족 peer는 하나도 없다.**

### 5.2 `react-is` — #125의 관찰을 반증하되, 안심할 근거는 아니다

#125는 "`recharts`가 선언한 `react-is` peer가 설치되지 않은 채로도 빌드·타입체크·axe가 통과했다"고 적었다. **설치는 되어 있다.**

```sh
grep -n '"react-is"' bun.lock
ls -l node_modules/.bun/recharts@*/node_modules/react-is
#  -> ../../react-is@17.0.2/node_modules/react-is
```

들어온 경로는 recharts와 무관하다:

```
apps/storybook devDependency  storybook@10.5.10
  └─ @testing-library/dom@10.4.1
      └─ pretty-format@27.5.1   ("react-is": "^17.0.1")
          └─ react-is@17.0.2      ← 트리 전체에서 유일한 출처
```

`react-is`를 직접 선언한 워크스페이스 패키지는 **없다**(`grep -n '"react-is"' package.json packages/*/package.json apps/*/package.json` → 결과 없음). bun이 이 17.0.2를 recharts의 peer 슬롯에 그대로 채웠고, `^17.0.0`을 만족하므로 경고 없이 통과한다.

**그리고 이 peer는 장식이 아니다.** recharts는 `es6/util/ReactUtils.js`에서 `import { isFragment } from 'react-is'`를 실제로 한다. 저장소 항목을 통째로 감추고 다시 빌드하면 — `sh packages/ui/bundle-probe/react-is-counterfactual.sh` —

```
--- react-is store entry hidden: node_modules/.bun/react-is@17.0.2 ---
# recharts-used
error: File not found ".../recharts@3.10.1+.../node_modules/react-is"
# recharts-story
error: File not found ".../recharts@3.10.1+.../node_modules/react-is"
```

**`ResponsiveContainer` 하나만 담는 빌드조차 실패한다.** recharts에 `exports` 필드가 없어 진입점이 barrel이고, 번들러는 570개 모듈을 **해석한 뒤에** 흔들기 때문이다. 최종 산출물에 `react-is` 코드가 0바이트라는 사실(§3.2)과 모순되지 않는다 — 해석은 필요하고 코드는 남지 않는다.

정리하면 세 문장이다. ⓐ `react-is`는 설치되어 있고 peer는 만족한다. ⓑ 그러나 그것을 트리에 넣은 것은 **Storybook의 개발 도구 사슬**이고, `@massive/ui`나 `recharts` 어느 쪽의 선언도 아니다. ⓒ 그 사슬이 끊기면(Storybook 교체·`@testing-library/dom` 상위 버전이 `pretty-format`을 떼는 등) recharts를 쓰는 모든 빌드가 즉시 깨진다. 버전 17.0.2가 React 19와 두 메이저 어긋나 있다는 사실도 recharts가 고른 것이 아니라 `pretty-format@27`이 고른 것이다.

> **미측정.** `@massive/ui`를 리포 밖으로 발행했을 때 소비처가 `react-is`를 어떻게 얻는지는 측정하지 않았다. 현재 소비처가 리포 안 Storybook 하나뿐이라 실험할 대상이 없다.

---

## 6. 직접 구현 비용의 대략적 크기

### 6.1 자(尺) — [#88](https://github.com/flameware/massive-design/issues/88)의 선례

upstream이 `cmdk`·`react-day-picker`를 쓰는 자리를 우리는 직접 구현했다.

```sh
wc -l packages/ui/src/components/ui/command.tsx packages/ui/src/components/ui/calendar.tsx
#   344  command.tsx
#   348  calendar.tsx
```

**컴포넌트 하나당 300~350줄에서 라이브러리 하나를 안 들이는 것이 이 리포의 실측 환율이다.** 참고로 51개 컴포넌트 전체가 4,473줄이므로, 이 둘이 전체의 15%를 차지한다.

### 6.2 대상별

| 대상 | 대체해야 할 표면 | upstream이 그 일에 쓰는 코드 | 크기 감(感) |
|---|---|---|---|
| `recharts`의 `ResponsiveContainer` | 부모 크기를 관찰해 자식에 `width`/`height`를 내려 주는 것 하나 | `ResponsiveContainer.js` 225줄(babel 헬퍼 포함), 번들 8,371 B, 모듈 10개, 실체는 `ResizeObserver` + `throttle` | **#88 환율의 1/5 이하.** `command.tsx` 344줄과 비교할 대상이 아니다 |
| `input-otp` | `OTPInput`(가려진 input + 슬롯 상태) + `context.slots[i]` | 발행본이 minify돼 있어 원본 줄 수를 셀 수 없다. 번들 10,022 B | **미측정.** 크기는 작지만 IME·자동완성(`data-lastpass-*`·`data-dashlanecreated` 흔적이 dist에 있다)·붙여넣기 처리가 얼마인지 세지 못했다 |
| `react-resizable-panels` | `Group`·`Panel`·`Separator` 세 개 — 그런데 이 셋이 라이브러리의 전부다 | `dist/react-resizable-panels.js` 2,259줄 / 56,241 B, 번들 32,743 B | **#88 환율의 6~7배.** 포인터 드래그·최소/최대 제약·키보드 리사이즈·`aria-valuenow` 갱신·레이아웃 저장이 전부 그 안에 있다 |
| `embla-carousel-react` | 훅 하나지만 그 뒤에 엔진이 통째로 있다 | `embla-carousel.esm.js` 1,670줄 / 48,089 B(+ react 바인딩 38줄), 번들 20,126 B | **#88 환율의 5배 안팎.** 우리가 부르는 API는 6개지만 그 6개가 드래그 물리·스냅·관성 위에 앉아 있다 |
| `radix-ui` 25개 네임스페이스 | part 124개 | 25개 leaf의 `dist/index.mjs` 합계 **8,954줄 / 359,819 B**, 번들 229,075 B | **#88 환율의 25~30배.** 게다가 줄 수가 재는 것은 코드일 뿐 포커스 트랩·`aria-*`·타이핑 탐색·collection 순서 같은 **동작**은 재지 못한다 |

### 6.3 이 절이 재지 못한 것

- **동작의 등가성.** 위 표는 전부 코드량 대리 지표다. "직접 구현했을 때 같은 접근성 동작을 내는가"는 줄 수로 재지지 않는다. #88이 Command·Calendar에서 그 비용을 실제로 치른 기록은 있지만, 그 두 개가 dismiss 제스처·포커스 트랩을 지지 않는 컴포넌트라 `Dialog`·`Select` 계열의 자로 쓰기에는 부족하다. **미측정.**
- **`radix-ui`를 Base UI로 갈아탈 때의 비용.** 이 티켓의 질문이 아니다 — [#150](https://github.com/flameware/massive-design/issues/150)이 센다.

---

## 7. 버전 정책

```sh
grep -n "radix-ui\|embla-carousel-react\|input-otp\|react-resizable-panels\|recharts" \
  packages/ui/package.json apps/storybook/package.json
node -e 'const fs=require("fs");for(const n of ["radix-ui","embla-carousel-react","recharts","input-otp","react-resizable-panels"]){\
  const d=Object.entries(JSON.parse(fs.readFileSync(`./packages/ui/node_modules/${n}/package.json`,"utf8")).dependencies||{});\
  console.log(n, "deps", d.length, "exact", d.filter(([,v])=>/^\\d+\\.\\d+\\.\\d+$/.test(v)).length)}'
```

| 의존성 | 우리 선언 | 고정 방식 | 자기 하위 의존의 고정 방식 |
|---|---|---|---|
| `radix-ui` | `^1.6.7` | **범위** | 55개 **전부 정확 고정**(`@radix-ui/primitive: 1.1.7` 식) |
| `embla-carousel-react` | `8.6.0` | 정확 | 2개 전부 정확 고정 |
| `recharts` | `3.10.1` | 정확 | 11개 중 **10개가 범위** |
| `input-otp` | `1.5.0` | 정확 | 없음 |
| `react-resizable-panels` | `4.12.3` | 정확 | 없음 |

- `apps/storybook`도 `recharts@3.10.1`을 **정확히** 선언한다(소비처가 차트 본체를 직접 가져오므로).
- `recharts`가 열어 둔 10개: `@reduxjs/toolkit@^1.9.0 || 2.x.x`, `clsx@^2.1.1`, `decimal.js-light@^2.5.1`, `es-toolkit@^1.39.3`, `eventemitter3@^5.0.1`, `immer@^11.1.8`, `react-redux@8.x.x || 9.x.x`, `tiny-invariant@^1.3.3`, `use-sync-external-store@^1.2.2`, `victory-vendor@^37.0.2`. 이 중 `@reduxjs/toolkit`과 `react-redux`는 **메이저 두 개를 걸친 범위**다.
- `bun.lock`이 커밋되어 있어 실제 설치는 재현된다. 위 범위는 락파일을 다시 만들 때에만 움직인다.

> **미측정.** 각 패키지의 npm 최신 버전과 우리 고정본의 차이(뒤처짐 폭)는 재지 않았다. 레지스트리 조회가 필요하고 이 조사는 로컬 트리만 근거로 삼았다.

---

## 8. 재현 자산

이 문서의 모든 숫자는 아래 두 묶음으로 다시 낼 수 있다. `bun install --frozen-lockfile`을 먼저 돌린 뒤 **리포 루트에서** 실행한다.

**설치 그래프·표면** — `docs/research/dependency-weight/`

| 스크립트 | 내는 것 |
|---|---|
| `pkg-meta.mjs <pkg…>` | 각 패키지의 `dependencies`·`peerDependencies`·`sideEffects` 원문 |
| `install-graph.mjs <pkg…>` | 심링크 그래프 BFS로 직접 의존과 전이 클로저 |
| `lock-closure.mjs` | 같은 계산을 `bun.lock`만으로 독립 재계산 |
| `exclusive-install.mjs` | 그 의존성에만 딸린 패키지 수 |
| `peers.mjs <pkg…>` | 선언 peer 대 실제 해석 버전 |
| `radix-surface.mjs` | `radix-ui` 네임스페이스별 사용 part / 런타임 part |

**번들** — `packages/ui/bundle-probe/`

| 스크립트 | 내는 것 |
|---|---|
| `measure.sh` | 프로브 17개의 raw/gzip 바이트 |
| `scan.sh` | 각 `@massive/ui` 프로브에 어떤 라이브러리가 살아남았는지(마커 문자열) |
| `modules.sh <probe>` | 소스맵 `sources`로 살아남은 모듈을 패키지별 집계 |
| `radix-each.sh` | radix 네임스페이스 25개 각각의 번들 비용 |
| `react-is-counterfactual.sh` | `react-is` 저장소 항목을 감췄을 때 recharts 빌드가 어떻게 되는지 |

프로브 진입점(`*.tsx`)이 `packages/ui/` 아래 있는 이유는 bun의 isolated 링커에서 `node_modules` 해석이 **진입 파일 위치**를 기준으로 일어나기 때문이다. 리포 루트나 `docs/` 아래에서는 `radix-ui`가 해석되지 않는다.

---

## 9. 확인하지 못한 것 (모아 보기)

1. **[#125](https://github.com/flameware/massive-design/issues/125)의 "설치 76개"를 재현하지 못했다.** 독립적인 두 방법이 43(peer 포함)/37(peer 제외)로 일치한다. §1.3.
2. **`@radix-ui/react-toast`가 `ui-cn` 번들에 남는 원인.** `sideEffects: false`인데도 남고, 최상위 부수효과 문장은 찾지 못했다. §3.4.
3. **bun 1.3.8 외의 번들러 거동.** 특히 `sideEffects` 미선언 패키지에 대한 Vite/Rollup·webpack의 처리. §3.4.
4. **`input-otp`의 원본 코드량.** 발행본이 minify돼 있어 줄 수를 세지 못했다. §6.2.
5. **직접 구현의 동작 등가 비용.** 코드량은 쟀지만 접근성 동작을 재는 자는 세우지 못했다. §6.3.
6. **`radix-ui`의 `unstable_OneTimePasswordField`가 `input-otp`를 대신할 수 있는지.** 표면 대조를 하지 않았다. §2.3.
7. **npm 최신 버전 대비 뒤처짐 폭.** 레지스트리를 조회하지 않았다. §7.
8. **리포 밖 소비처에서의 `react-is` 조달 경로.** 소비처가 리포 안 하나뿐이라 실험 대상이 없다. §5.2.
