# 겹침 링은 `background`가 아니라 `border.knockout`이다

겹친 아바타를 가르는 링은 **뒤에 있는 면을 되그려 파내는 것**이다. 값은 `bg.canvas`와 같다. 그래서 upstream은 `ring-background`로 쓰고, 우리도 그렇게 쓰고 싶었다.

그런데 그 한 줄이 우리 파생 채널에서는 통과하지 못한다. [#143](https://github.com/flameware/massive-design/issues/143)이 `AvatarGroup`을 열면서 다섯 후보를 전부 재 봤고, **네 개가 서로 다른 방식으로 걸렸다.**

| 후보 | 매니페스트가 잡는가 | 게이트 | 호환성 |
|---|---|---|---|
| `border-2 border-background` | ✅ `border-color` | ❌ `lint.mjs` 규칙 3 — `border-color`에 `--ds-bg-canvas`가 온다 | additive |
| `ring-2 ring-background` | ⚠️ box-shadow로 컴파일 → `shadow-*` 스케일에 없어 **`unresolved`** | 통과하나 Figma가 못 그린다 | additive |
| `outline-2 outline-background` | ❌ `outline-color`·`-style`·`-offset`이 전부 `IGNORED_PROPERTIES` | 통과 — **침묵으로** | additive |
| 링 없이 겹침만 | — | 통과 | additive |
| `bg-background`+패딩을 `Avatar` 루트에 | ✅ `background-color`+`padding` | 통과 | ❌ 기존 셀 3개가 움직인다 |

## 결정

**`--ds-border-knockout`을 semantic 토큰으로 세운다.** 값은 `bg.canvas`와 같고(`neutral.light.2` / `neutral.dark.1`), **계열이 다르다.** alias `--knockout`을 함께 내어 컴포넌트가 `border-knockout` 클래스로 소비한다.

**그리고 링은 `avatarVariants`의 축이다.** `knockout: { none, ring }`, 기본값 `none`. `AvatarGroup`이 context로 `ring`을 넣어 준다 — `ToggleGroup`→`ToggleGroupItem`과 같은 모양이다.

## 왜 이 모양인가

**값이 같은데 이름을 나눈 이유는 계열 게이트다.** `packages/ui`의 `lint.mjs` 규칙 3은 `border-color`↔`--ds-border-*` 계열 일치를 본다([#37](https://github.com/flameware/massive-design/issues/37)). 이 규칙은 "배경용 이름을 글자색에 쓴 자리"를 잡으려고 세운 것이고, 여기서 그 규칙이 **정확히 의도대로** 물었다 — `border-background`는 실제로 계열을 어긴다. 게이트를 우회하는 대신 **없던 계열 항목을 만든 것**이 이 ADR의 결정이다.

**`knockout`이라는 이름은 역할을 말한다.** `border.canvas`가 더 쉬운 이름이지만, 그렇게 부르면 **왜 별도 이름이 필요한지 자체가 설명되지 않는다** — 값이 `bg.canvas`와 같으니 다음 사람이 "그냥 canvas를 쓰면 되지 않나"로 되돌아온다. `knockout`은 그 이유가 이름 안에 있다. `--ds-border-*`의 다른 여덟이 "어떤 테두리"로 이름 지어진 것과 문법이 다르지만(`border.field`가 이미 "무엇을 위한"에 가깝다), 오용을 막는 값이 계열 내 문법 일관성보다 크다.

**축인 이유는 침묵을 피하기 위해서다.** context로 클래스만 붙이면 링이 셀에 나타나지 않는다 — 파생 채널이 나르는 것은 셀이므로, **보이는 선인데 매니페스트에 없는** 상태가 된다. [ADR-0006](0006-uncontracted-surfaces.md)이 닫으려는 침묵 그 자체다. 축으로 두면 `avatar` 셀이 3개에서 6개로 늘고 Figma가 variant로 그린다.

## 고려한 대안

- **`outline-*`을 쓴다** — 가장 싸고, 게이트가 **통과시킨다.** 그게 문제다: `outline-color`는 포커스 링 때문에 `IGNORED_PROPERTIES`에 올라 있어 매니페스트가 이 링을 아예 담지 않는다. 통과가 아니라 침묵이고, 침묵인 줄 알려면 `classify.mjs`를 읽어야 한다.
- **`ring-*`을 쓴다** — upstream과 같은 모양이다. Tailwind가 box-shadow로 컴파일하는데 우리 `classify.mjs`는 `shadow-*` 유틸리티만 Effect Style로 옮기고 나머지 box-shadow는 `unresolved`로 떨어뜨린다. 정직하긴 하나 Figma가 그리지 못하는 것은 같고, [#140](https://github.com/flameware/massive-design/issues/140)이 다루는 `unresolved` 더미를 하나 더 얹는다.
- **링을 포기한다** — 그러면 `AvatarGroup`에 남는 것이 음수 마진뿐이라 [#74](https://github.com/flameware/massive-design/issues/74)·[#119](https://github.com/flameware/massive-design/issues/119) 기준으로 **카탈로그 자산이 아니게 된다.** [#121](https://github.com/flameware/massive-design/issues/121)이 ⓑ를 통과시킨 근거가 "겹침·ring·절대 배치 복제"였으므로, 링을 빼면 승격 판정 자체가 무너진다.
- **`Avatar` 루트에 `bg-background`+패딩** — 파생 채널에는 가장 깨끗하다(`background-color`와 `padding` 둘 다 잡히고 Figma가 프레임 채우기+패딩으로 그린다). 그러나 루트 클래스를 바꾸는 일이라 **기존 셀 3개가 전부 움직여** additive가 아니다. 이 맵이 additive를 전제로 서 있다.
- **면마다 링 색을 가르는 축을 연다** — 아래 한계를 없앤다. 대신 셀이 면 수만큼 곱해지고, 소비처가 자기가 놓인 면을 알아야 한다.

## 파급

**면색이 canvas로 고정된다.** 카드(`--card`)나 팝오버(`--popover`) 면 위에 놓인 그룹에서는 링이 그 면과 어긋난다. upstream도 `ring-background`로 같은 한계를 갖지만, 우리는 그것을 `avatar`의 `limits`에 적는다 — 소비처가 그 자리에서 `border-card` 같은 클래스로 덮는다. **침묵은 선택지가 아니다.**

**어휘 상한 래칫이 35 → 36으로 올라간다.** `tokens:lint`의 B8, `tokens.d.ts` union, Figma 주입 수, Foundations 데이터, 교차 alias 수(34 → 35) — 다섯 자리가 한 번에 움직인다. 그 게이트들의 목적이 **새 토큰을 의식적인 행위로 만드는 것**이므로 이 ADR이 그 근거를 진다.

**`border.knockout`은 대비 조합표 밖이다.** `border.default`·`border.field`와 같은 이유로 비텍스트 3:1 대상이 아니고, 한 겹 더 밖이다 — 뒤 면을 되그려 **지우는** 자리라 대비를 내는 것이 목적이 아니고, 값이 면색과 같아 자기가 놓이는 면과의 대비는 정의상 1:1이다.

**이 토큰은 Avatar 전용이 아니다.** 겹쳐 놓는 자산이 또 생기면(스택된 칩, 겹친 썸네일) 같은 이름을 쓴다. 그때 위 한계도 함께 따라간다.
