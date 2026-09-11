import type { CSSProperties, ReactNode } from "react"

/* Foundations 표 넷(ColorTable·RadiusScale·SpaceScale·TypeScale)이 각자
 * 반복하던 헤더·데이터 셀 스타일. 패딩 값은 표마다 다르므로(ColorTable은
 * 4px, 나머지 셋은 6px, 마지막 열은 오른쪽 여백을 빼기도 한다) 값을 여기서
 * 고정하지 않고 호출부가 넘긴다 — 표 하나의 셀 **모양**(태그·병합 방식)을
 * 고칠 때 이 파일 하나만 고치면 넷에 반영된다. 표마다 다른 패딩 *값*은
 * 여전히 각 표의 몫이다. */

export function Th({ children }: { children: ReactNode }) {
  return <th style={{ textAlign: "left" }}>{children}</th>
}

export function Td({
  children,
  padding,
  style,
}: {
  children: ReactNode
  padding?: CSSProperties["padding"]
  style?: CSSProperties
}) {
  return <td style={{ ...(padding !== undefined ? { padding } : {}), ...style }}>{children}</td>
}
