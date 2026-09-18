import { createContext, useContext } from "react"

/* ToggleGroup이 안의 Toggle에게 내리는 크기(#466). 그룹은 **판의 겉**이 컨트롤
 * 높이(sm 32 · md 36 · lg 40, CONTEXT.md §컨트롤 높이)를 지고, 안의 항목은 판의
 * 여백·테두리만큼 작아진다 — 그래서 항목의 크기는 항목이 아니라 그룹이 정한다.
 *
 * CSS 자손 선택자(`[&>button]:h-7.5`)로 덮지 않고 context로 내리는 이유: Toggle의
 * cva 클래스와 같은 속성을 두고 명시도·방출 순서로 다투게 되고, 소비처가 Toggle에
 * 준 `size`와도 다툰다. context면 Toggle이 자기 클래스를 처음부터 그룹 안 값으로
 * 고른다.
 *
 * 두 파일(toggle·toggle-group)이 한 context를 봐야 하므로 둘 중 어느 쪽도 아닌
 * 여기에 둔다 — ToggleGroup이 Toggle 컴포넌트를 import하지 않아도 된다. */
export type ControlSize = "sm" | "md" | "lg"

/** 그룹 밖이면 null — Toggle은 자기 `size`를 쓴다 */
export const ToggleGroupSizeContext = createContext<ControlSize | null>(null)

export function useToggleGroupSize(): ControlSize | null {
  return useContext(ToggleGroupSizeContext)
}
