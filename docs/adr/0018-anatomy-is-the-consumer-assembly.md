# `anatomy`는 **소비처가 조립하는 것**을 이름한다

[ADR-0006](0006-uncontracted-surfaces.md)이 미계약 표면을 두 관문으로 가르고 *"대문자로 시작하는 공개 export는 anatomy에 이름이 있어야 한다"*는 게이트를 세웠다. 그런데 그 ADR은 anatomy의 **존재**를 지킬 뿐 anatomy가 **무엇을 이름하는가**는 정한 적이 없다. [#172](https://github.com/flameware/massive-design/issues/172)가 그 공백이 실제로 무엇을 낳았는지 찾았다.

**Portal 일곱이 절반만 공개돼 있었다.** `Dialog`·`Sheet`·`AlertDialog`는 `DialogPortal` 꼴의 래퍼를 만들어 공개하고 anatomy에 올렸고, `DropdownMenu`·`Menubar`·`Popover`·`Select`는 `Content` 안에서 `XPrimitive.Portal`을 인라인으로 감싸고 아무것도 공개하지 않는다. **어느 계약도 왜 그런지 적지 않았다**([#162](https://github.com/flameware/massive-design/issues/162) §5.2 ②-13).

#172는 이것을 ADR-0006의 관문으로는 가를 수 없다고 의심했다 — 관문 ⓐ(파생 채널이 구분하는가)로 재면 Portal은 클래스도 셀도 없어 **일곱이 다 실패하는데 셋은 이미 열려 있기** 때문이다. 그래서 *"ⓐ·ⓑ가 닿지 않는 표면 종류가 있는가"*를 물었다.

**답은 아니오였고, 전제가 사실에서 무너졌다.**

- **셋의 export는 작동하지 않는다.** `DialogContent`가 **스스로** `DialogPortal`을 감싼다(`dialog.tsx`, `sheet.tsx`, `alert-dialog.tsx` 모두). 소비처가 `<DialogPortal><DialogContent/></DialogPortal>`을 쓰면 Portal이 이중으로 생기고, 바깥에 준 `container`는 안쪽이 기본 컨테이너로 다시 포탈해 **무시된다.** 즉 셋이 공개한 것은 경로가 아니라 함정이다.
- **소비처가 조립하지 않는다.** 리포 전체에서 `components/ui/` 밖에 이 셋을 쓰는 코드가 없다 — 생성물에만 이름이 있다.
- **anatomy에 있는 것은 판정이 아니라 export의 부산물이다.** 게이트가 `publicExports` → `anatomy` 한 방향을 강제하므로(`component-contracts.mjs`), 셋의 anatomy에 `Portal`이 있는 것은 누가 해부학적으로 판정했기 때문이 아니라 **export 했기 때문**이다.

그러므로 ⓐ·ⓑ는 멀쩡했다. **셋이 근거 없이 열렸을 뿐이고, ⓑ는 오히려 결정적으로 실패한다 — 소비처가 스스로 할 일이 애초에 없으니 샐 계약이 없다.**

## 결정

### 1. `anatomy`는 소비처가 조립하는 노드를 이름한다

소비처가 JSX에 **직접 쓰는** 노드만 anatomy다. 컴포넌트가 자동으로 렌더하는 내부 노드는 렌더 트리에 실재하더라도 anatomy가 아니다.

렌더 트리로 읽는 대안은 경계가 없다 — primitive가 만드는 모든 내부 노드가 들어와야 하고, 그 목록은 서드파티 버전이 바뀌면 우리 판단 없이 움직인다. anatomy는 파생 채널이 그릴 자리이자 **소비처가 읽는 조립도**이므로, 조립할 수 없는 이름이 거기 있으면 그것은 안내가 아니라 오해다.

이 정의가 [ADR-0006](0006-uncontracted-surfaces.md)을 부정하지 않는다. 관문 ⓐ·ⓑ는 그대로 서고, #172가 의심한 *"관문이 닿지 않는 표면"* 은 **존재하지 않았다.** 이 ADR은 관문의 **대상**을 정의하는 한 층 아래다.

### 2. 따라서 Portal 일곱은 전부 계약 밖이다

넷은 열린 적이 없고, 셋은 `publicExports`·`anatomy`·배럴 export에서 **제거한다.** 래퍼 함수 자체는 `Content`가 쓰므로 남되, `data-slot`은 함께 걷는다 — `data-slot`은 장식이 아니라 Tailwind 임의 변형의 선택자 표적이고 분류기가 그 형태를 읽으므로([ADR-0013](0013-slot-labels-are-borne-by-the-contract.md)), 계약이 이름하지 않는 라벨을 코드에 남기면 **계약에서는 같아지고 코드에서는 갈린 채**로 끝난다. 다음 재조회가 정확히 그 차이를 다시 발견한다.

포탈 대상을 고르는 경로가 필요해지면 **노드가 아니라 `Content`의 prop으로 온다.** 그래야 이중 Portal이 재발하지 않는다. 지금 여는 것은 실측 수요가 없어 거부한다([#123](https://github.com/flameware/massive-design/issues/123)).

### 3. `breaking`으로 분류하되 실행한다 — 그리고 이 길이 닫히는 **계기**를 함께 못박는다

공개 export를 없애는 것은 형식상 `breaking`이고 그렇게 분류한다. 그럼에도 실행하는 근거는 **깨질 소비처가 존재하지 않는다**는 사실이다: `@massive/ui`는 `private: true`, `version: 0.0.0`이며 npm에 발행된 적이 없고(`npm view` → 404), 리포 안 사용처가 0이며, `verification/figma-baseline.json`은 `anatomy`도 `Portal`도 담지 않는다.

**이 길은 그 상태가 참인 동안만 열려 있다. 닫는 계기는 첫 npm 발행이다** — 날짜가 아니라 사건이며, [ADR-0016](0016-primitive-base-stays-radix.md)이 정한 모양 그대로다. 발행 이후에는 소비처 부재를 근거로 `breaking`을 실행할 수 없고, 그때부터는 deprecation과 마이그레이션이 필요하다.

근거가 **시간이 아니라 상태**에 걸려 있으므로, 조건 없이 일반화하면 근거가 사라진 뒤에도 규칙만 남아 진짜 소비처를 깬다.

## 고려한 대안

- **ADR-0006을 개정해 셋째 관문을 더한다** — #172가 예상한 모양이다. 그러나 관문은 멀쩡했고 정의가 없었을 뿐이라, 없는 문제에 관문을 세우게 된다. 그리고 한 ADR이 *판정 기준*과 *판정 대상의 정의* 두 층을 말하게 된다 — [ADR-0008](0008-axis-and-value-name-spaces.md)이 축·값 이름 공간을 별도 문서로 세운 선례가 이쪽이다.
- **셋을 남기고 `limits`에 "근거 없이 열렸으나 되돌리지 않는다"만 적는다** — 가장 싸고 형식적으로 가장 안전하다. 그러나 게이트가 `publicExports` → `anatomy`를 강제하므로 **export를 남긴 채 anatomy에서만 빼는 중간 상태가 성립하지 않는다.** 둘 다 남기면 계약이 자기 정의를 위반한 상태를 문장으로 박제하게 된다 — ADR-0006이 닫으려는 침묵의 최악 형태, 즉 **기록이 있는데도 틀린 채 남는** 자리다.
- **넷을 열어 일곱을 맞춘다** — 대칭은 얻지만 아무도 조립하지 않는 노드를 넷 더 공개하고, 그중 일부는 `Content`가 이미 감싸고 있어 같은 이중 Portal 함정을 넷으로 늘린다.
- **`limits` 문장을 일곱에 그대로 복사한다** — 같은 근거를 손으로 만든 사본 일곱 개로 두는 것은 이 리포가 이미 세 번 새게 한 모양이다([#124](https://github.com/flameware/massive-design/issues/124)·[#125](https://github.com/flameware/massive-design/issues/125)·[#127](https://github.com/flameware/massive-design/issues/127)). 근거는 이 ADR이 지고 각 `limits`는 **자기 사실만** 진다.

## 파급

**`Overlay`가 같은 자리에 있다.** `DialogOverlay`·`SheetOverlay`·`AlertDialogOverlay`도 `Content`가 자동으로 그리는데 공개돼 있고 anatomy에 있다. 그러나 Portal과 갈린다 — Overlay는 **클래스를 내는 우리 노드**(`fixed inset-0 bg-black/50`)라 관문 ⓐ를 통과할 수 있다. 한 티켓에 섞으면 근거가 흐려지므로 여기서 판정하지 않는다. **그리고 그 모집단은 이 정의가 서야 기계적으로 잴 수 있다** — "자동 렌더되면서 공개된 노드"를 이 ADR이 처음으로 이름 붙였기 때문이다. [#165](https://github.com/flameware/massive-design/issues/165)의 안개가 이 자리를 가리킨다.

**게이트는 정의를 지키지 못한다.** `publicExports` → `anatomy`는 이름의 **존재**를 볼 뿐, 그 이름이 소비처가 조립하는 것인지 컴포넌트가 자동으로 렌더하는 것인지 구별할 수단이 없다 — 코드를 읽어야 알기 때문이다. [ADR-0006](0006-uncontracted-surfaces.md)이 *"게이트가 볼 수 없는 것을 주장하지 않는다"*고 한 자리이고, 이 정의는 **사람이 지는 규율**이다. 다음 재조회가 이 자리를 다시 보게 된다.

**`limits`의 공백 대장 성격이 한 겹 더 두꺼워진다.** ADR-0006이 이미 *"열지 않기로 한 것까지 문장으로 남긴다"*로 그 성격을 갈랐고, 여기서 일곱 계약이 각자의 사실을 더한다. 근거가 ADR에 있으므로 문장은 짧다 — 다음 세대가 근거를 고칠 때 일곱이 아니라 한 곳을 고친다.
