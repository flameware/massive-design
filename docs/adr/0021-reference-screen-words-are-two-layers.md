# 참조 화면의 낱말은 두 층이고, 스토리 제목은 라벨이 아니다

Storybook 화면의 문구가 영어 라벨과 한국어 서술로 섞여 있고, 한국어 화자가 읽었을 때 도움이 되지 않는다는 판정에서 출발했다. 손으로 적힌 영어 라벨은 두 파일에 있다 — `apps/storybook/stories/CatalogReference.tsx`(Executable reference · Generated contract · Anatomy · Axes · Configuration states · Required samples · Usage and provenance · Use · Invest Diary evidence · Boundary)와 `apps/storybook/stories/System.stories.tsx`(페이지 제목 셋, 소제목 여섯, 표 머리 넷, 스토리 `title` 둘).

문제는 "영어냐 한국어냐"가 아니라 **그 영어가 두 종류라는 것**이었다.

## 결정

### 1. 화면이 지어낸 이름만 옮기고, 실재 문자열은 손대지 않는다

`AccordionTrigger`·`expansion: single | multiple`·`CODE_VERIFIED`·`src/components/ui/accordion.tsx`·`4f3463aca5d6`·`bun run sync:preflight`는 코드·매니페스트·검증 기록·Figma에 그 철자로 실재한다. 옮기면 **찾을 수 없게 된다** — 화면이 이름의 정본이 아니라 정본을 비추는 자리이기 때문이다. `Executable reference`·`Coverage ledger`·`Usage and provenance`·`Boundary`는 어디에도 실재하지 않고 이 화면에서만 태어났다. 옮기는 것은 이쪽뿐이다.

경계선은 **어느 쪽이 정본을 갖는가**이지 낱말이 영어인가가 아니다. 그래서 `Configuration states:` 라벨은 한국어가 되고 그 오른쪽 `expansion: single | multiple`은 그대로 남는다.

### 2. 스토리 `title`은 라벨처럼 보이지만 식별자다 — 바꾸지 않는다

`Components/Manifest references`에서 51개 스토리 ID가 파생되고(`components-manifest-references--accordion`), 그 ID가 `verification/repo-verification.json`의 axe 증거와 `a11y-report.json`에 박혀 있으며 Coverage ledger가 각 컴포넌트로 거는 링크(`System.stories.tsx`)도 그것이다. 옮기면 **이미 기록된 증거가 가리키는 곳이 사라진다** — 재생성으로 복구되지만 그 순간 "기존 증거 무효" 판정이 필요하고, 그것은 낱말을 고치는 일이 무는 값이 아니다.

그래서 사이드바에는 영어가 남고 본문 `<h1>`만 한국어인 상태가 된다. **이 비대칭은 결함이 아니다** — 결정 1의 선이 여기에도 그대로 걸린 결과이고, 다음 세대가 "통일"하려 들지 않도록 여기 적는다.

### 3. 두 페이지의 독자가 다르므로 어휘 층이 다르다

`Components` 페이지의 독자는 소비처 개발자이고 그가 내리는 결정은 "이 자리에 이것을 쓸까"다. `System` 페이지 셋의 독자는 유지보수자이고 결정은 "지금 무엇이 어긋나 있나"다. 그래서 System 쪽은 `CONTEXT.md`의 정본 낱말(구성 상태·조합·세대·상태 견본)을 그대로 쓰는 것이 **더 정확하고**, Components 쪽은 그 낱말들이 오히려 장벽이라 평이한 말을 허용한다.

한 기준을 51장 전부에 밀면 반드시 한쪽이 어색해진다. 비대칭이 판단의 결과라는 사실이 적혀 있지 않으면 다음 세대가 그것을 불일치로 읽는다.

### 4. 평이한 말을 허용하되 새 낱말 발명은 금지한다

글로서리에 이름이 있는 것을 화면에서만 다르게 부르지 않는다. `Invest Diary evidence`가 정확히 그 위반이었다 — 글로서리에 **소비처**가 있는데 화면만 특정 앱 이름으로 불렀고, 그래서 그 필드가 무엇의 근거인지가 화면에서만 달라졌다. 이름은 **소비처 근거**다.

## 고려한 대안

- **전부 영어로 통일한다** — 라벨은 고르지만 51×3 서술이 이미 한국어이고 그것을 옮기는 것은 이 결정의 범위가 아니다. 그리고 정본 문서인 `CONTEXT.md`가 한국어라 화면만 영어면 정본에서 더 멀어진다.
- **사이드바까지 전부 한국어로 통일한다** — 보기에 가장 깔끔하고, 그 대가가 결정 2가 재는 값이다. 화면 문구를 고치는 작업이 검증 증거를 무효화하는 것은 비용이 맞지 않는다.
- **i18n 층을 도입한다** — 독자가 한국어 화자 하나인 동안 층 하나를 얹는 일이고, 지금 문제(어느 낱말이 정본을 갖는가)는 번역 층이 있어도 그대로 남는다.
