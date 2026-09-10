/* 계약의 후계는 얇은 meta 하나다 (ADR-0023 §6, 스토리 37).
 *
 * 컴포넌트가 자기에 대해 선언하는 것은 `category`·`status`·`since` 셋뿐이고,
 * 읽는 곳은 둘뿐이다 — 사이드바 순서(preview.tsx의 storySort)와 상태 표
 * (stories/status). **meta를 검증하는 도구는 만들지 않는다**: 1세대의 교훈이
 * "선언이 커질수록 선언을 검증하는 일이 본업을 삼킨다"였고, 여기서 틀린 값은
 * 타입이 잡거나 사이드바에서 눈에 띈다.
 *
 * 선언하는 자리는 CSF의 `meta`다 — 컴포넌트 소스가 아니라. 소스에 넣으면
 * 문서용 문자열이 소비처 번들의 바닥값에 얹힌다(ADR-0017). */

/* 분류(category) — 문서 사이드바의 묶음이고 층위와 다른 축이다(ADR-0023 §7).
 * **배열의 순서가 곧 사이드바의 순서다.** 알파벳순이 아닌 이유는 역할로 찾기
 * 때문이다: 무엇을 누르는가(Actions)가 무엇을 담는가(Layout)보다 앞이다. */
export const CATEGORIES = [
  "Foundations",
  "Actions",
  "Forms",
  "Navigation",
  "Overlays",
  "Feedback",
  "Data display",
  "Layout",
  "Typography",
  "Patterns",
] as const

export type Category = (typeof CATEGORIES)[number]

/* 상태(status) — 한 컴포넌트의 성숙도. 넷뿐이고 순서가 성숙 순서다. */
export const STATUSES = ["planned", "preview", "stable", "deprecated"] as const

export type Status = (typeof STATUSES)[number]

export interface DsMeta {
  status: Status
  /** 이 모양이 처음 나간 패키지 버전 */
  since: string
}

/* 분류와 이름은 CSF의 `title`이 진다 — `"Actions/Button"`.
 *
 * `ds` 안에 category를 한 번 더 적지 않는 이유는 사본이 둘이면 어긋나고, 어긋남을
 * 잡는 도구가 또 생기기 때문이다(ADR-0023 §6이 막으려는 바로 그것). title은
 * Storybook이 사이드바를 묶는 데 이미 쓰는 문자열이고, 상태 표는 같은 문자열을
 * 읽는다 — 정본이 하나다.
 *
 * title을 분류에서 **계산**하지 못하는 이유는 Storybook의 색인기가 CSF의 기본
 * 내보내기를 실행하지 않고 정적으로 읽기 때문이다. 함수로 감싸면 색인 자체가
 * 실패한다. 대신 타입이 첫 마디를 열 개 분류로 묶는다 — 오타는 컴파일에서 죽는다. */
export type ComponentTitle = `${Category}/${string}`

export interface ComponentMeta {
  title: ComponentTitle
  parameters: { ds: DsMeta }
}

export function categoryOf(title: string): Category | undefined {
  const first = title.split("/")[0] as Category
  return CATEGORIES.includes(first) ? first : undefined
}

export function nameOf(title: string): string {
  return title.slice(title.indexOf("/") + 1)
}
