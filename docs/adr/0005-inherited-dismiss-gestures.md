# 상속 dismiss 제스처를 얕게 계약한다

Toast는 오른쪽으로 50px 끌면 닫힌다. 우리가 구현한 적 없고, 어느 문서에도 적힌 적 없으며, 그대로 발행돼 있었다. `radix-ui` Toast의 기본값(`swipeDirection: "right"`, `swipeThreshold: 50`)이 `ToastProvider = ToastPrimitive.Provider` 통과분으로 그냥 따라온 것이다([#110](https://github.com/flameware/massive-design/issues/110)).

게다가 반쪽이었다. `data-[swipe=…]` 스타일이 리포 전체에 0건이라 **끄는 동안 아무 일도 일어나지 않다가 임계값에서 갑자기 사라졌다.** 터치가 이 시스템의 1급 대상이라는 [#97](https://github.com/flameware/massive-design/issues/97)의 전제에서 이건 인상이 아니라 결함이다.

그래서 **상속 제스처를 얕게 계약한다.** 제스처 물리는 구현하지 않는다 — `packages/ui`의 의존성 경계(`radix-ui`·cva·clsx·tailwind-merge)는 그대로 닫힌다. 계약이 지는 것은 셋뿐이다: **존재**(어느 표면이 제스처로 닫히는가) · **시각 피드백**(끄는 동안 따라오는가) · **접근성 동등 경로**(제스처를 쓸 수 없는 사용자가 닫는 공개 수단).

자리는 `externalSurfaces`([#122](https://github.com/flameware/massive-design/issues/122))와 같은 모양의 선택적 `gestures` 계약 필드다. 둘은 **방향이 반대인 같은 종류의 공백**이다 — 외부 소유 표면은 영영 우리 것이 아닌 노드이고, 상속 표면은 우리 이름으로 나가는데 계약이 모르는 동작이다.

## 고려한 대안

- **제스처를 끈다** — `swipeDirection`을 무효화하고 "제스처 dismiss는 소비처가 소유한다"를 `limits`에 적는다. 완료 정의가 가장 깨끗해지지만 터치가 1급 대상이라는 #97과 어긋나고, [#125](https://github.com/flameware/massive-design/issues/125)가 Carousel의 스와이프를 위임할 곳이 사라진다.
- **켜둔 채 `limits` 한 줄만** — 가장 싸다. 그러나 이 이슈의 발단이 정확히 "적히지 않은 채 출하되는 동작"이고, `limits`는 산문이라 **적혔는지를 기계가 못 본다** — 43개를 사람이 전수 대조하는 [#121](https://github.com/flameware/massive-design/issues/121)이 그래서 따로 필요했다.
- **깊게 계약한다(스냅 포인트·peek·비모달)** — 제스처 물리가 필요하므로 의존성을 열어야 하고, 그건 #97이 Drawer를 닫으며 "동작만으로는 자기 자리를 증명하지 못한다"고 판정한 것을 다시 여는 일이다.
- **방향·임계값까지 공개 계약** — 소비처가 값에 의존할 수 있게 된다. 그러나 그 값은 우리가 정한 적 없는 물려받은 것이고, 계약에 박는 순간 upstream이 기본을 바꿔도 우리가 유지해야 하는 약속이 된다. 우리가 잃고 있던 것은 방향값이 아니라 피드백과 문장이었다.

## 파급

**게이트는 선언의 모양까지만 지킨다.** 닫히는 표면이 우리 anatomy인지, 동등 경로가 공개 export인지, 선언한 피드백 클래스가 `className()` 결과에 실제로 붙어 있는지는 본다. 애니메이션이 옳은지는 못 본다. Storybook이 카탈로그에서 생성되는 파생 채널이라 손으로 쓴 인터랙션 스토리가 없고 `packages/ui` 테스트에는 DOM이 없어, **제스처의 자동 검증은 0이다.** 동작은 `design-system-sync.md`의 터치 확인에서 사람이 판정한다.

**upstream 확인은 사람이 지는 규칙이다.** 게이트는 "이 primitive가 제스처를 갖고 오는지"를 판정할 수 없다 — 서드파티 소스를 읽어야 알기 때문이다. 그래서 열거는 계약이 지고 규칙은 절차가 진다. 지킬 수 없는 것을 지킨다고 적지 않는 것이 `externalSurfaces`가 이미 택한 정직함이다.

**`gestures`는 매니페스트에 내보내지 않는다.** `externalSurfaces`가 매니페스트로 가는 이유는 Figma Sync가 "아직 못 다룬 것"과 "영영 우리 것이 아닌 것"을 구분해야 하기 때문인데, 동작에는 그 모호함이 없다 — 파생 채널이 나르는 것은 anatomy와 구성 상태뿐이라 제스처는 애초에 거기 없다. 내보내면 Figma가 할 일이 없는데도 세대 해시가 바뀌어, [#115](https://github.com/flameware/massive-design/issues/115)가 세운 폰트 되돌림·재바인딩 사이클이 시각적 변화 없이 한 번 돈다.

**제스처 피드백 수식자는 `ignore`이지 `unresolved`가 아니다.** `data-[swipe=…]`를 분류하지 않으면 Toast 매니페스트에 `unresolved` 40개가 뜨는데, `unresolved`는 "아직 못 다뤘다"라는 등급이라 영영 Figma에 가지 않을 것에 붙이면 그 등급이 다시 잡동사니가 된다. `MODIFIER_POLICY`에 이유와 함께 `ignore`로 넣어 Toast의 세대 해시를 기준선과 동일하게 유지했다.

**컨트롤 제스처는 이 계약 밖이다.** Slider·Scroll Area·Carousel의 드래그는 컨트롤의 기능 자체여서 표면이 사라지지 않고, 키보드 동등 경로가 이미 각 계약 안에 있다. #125가 "스와이프를 #110에 위임한다"고 적어 둔 것 중 실제로 위임되는 것은 없다 — Carousel의 드래그는 dismiss가 아니라 컨트롤 제스처다.
