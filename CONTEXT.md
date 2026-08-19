# 용어

massive-design의 어휘. 다른 말로 부르지 말 것.

## 토큰 계층

- **primitive** — 값을 직접 갖는 토큰. 컬러 램프 12단계와 비색상 스케일. 소비처에 노출되지 않는다(Tailwind `@theme`에 등록하지 않는다).
- **semantic** — primitive를 참조하는, 용도로 이름 붙인 토큰. `bg.* / fg.* / border.*` 30개. 라이트/다크 모드 전환은 **오직 이 계층에서만** 일어난다.
- **component** — semantic만 참조하는 계층. **규칙만 존재하고 토큰은 0개다.**
- **alias** — shadcn이 정한 이름을 우리 semantic에 이어 붙인 호환 레이어. 우리가 발명한 어휘가 아니므로 어휘 상한 계산에 넣지 않는다.

## 램프

- **램프(ramp)** — 한 패밀리의 12단계 색 배열. 패밀리·모드마다 한 벌(`brand/light`, `brand/dark`, …).
- **키 컬러(key color)** — 램프를 생성하는 입력 색. **step 9에 앉는다** — light/dark가 동일한 유일한 단계이기 때문.
- **패밀리(family)** — brand / neutral / danger / success. warning·info는 아직 없다.
- **cusp** — 주어진 hue에서 sRGB 안에 담기는 chroma가 최대가 되는 밝기. 램프의 채도 상한을 정한다.
- **override** — 생성된 램프를 손으로 덮는 것. ①패밀리 파라미터(구현됨) / ②단계별 L·C·H(자리만 있고 미검증).

## 상태 표현

- **state layer** — 상태 색 토큰을 두는 대신, 기본 색 위에 반투명 층을 `color-mix`로 얹어 hover·pressed·disabled를 만드는 방식. **상태 색 토큰은 0개다.** Figma는 이걸 표현하지 못한다.

## 출력과 주입

- **주입(injection)** — 빌드가 낸 JS를 MCP `use_figma`로 실행해 Figma에 Variables·Style·Component를 만드는 것. 파일을 밀어 넣는 push가 아니라 **에이전트가 수행하는 절차**다.
- **매니페스트(manifest)** — `@massive/ui`가 내는, 컴포넌트 구조를 기계가 읽을 형태로 담은 생성물. 출처는 `cva` 정의이지 스토리 파일이 아니다.
- **생성물(generated artifact)** — 원본에서 파생돼 **커밋되는** 파일. `.gen.json` 접미사나 `dist/` 위치로 표시한다. 손편집 금지이고 `verify`가 감시한다.

## 경계

- **소비처(consumer)** — 이 디자인 시스템을 가져다 쓰는 앱. 현재는 invest diary 하나이고 **리포 밖**이다. `packages/ui`는 소비처가 아니라 시스템의 일부다.
