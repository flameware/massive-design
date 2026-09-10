"use client"

/* Dialog(shared.tsx)와 Drawer(drawer.tsx)가 우상단 "닫기" 아이콘 버튼에
 * **똑같이** 쓰는 조각. 밑에 깔린 Base UI 컴포넌트는 서로 달라서
 * (`DialogClose` vs `DrawerClose`) `OverlayClose`처럼 함수 하나로 감쌀 수는
 * 없지만, 그림(SVG 패스)과 클래스 문자열이 어긋나면 두 오버레이의 닫기
 * 버튼이 조용히 달라 보이므로 그 둘만은 한 자리에서 관리한다. */

export const closeButtonClassName = [
  "hit-area absolute right-4 top-4 inline-flex size-6 items-center justify-center rounded-sm",
  "text-muted opacity-70 outline-offset-2 transition-opacity hover:text-default hover:opacity-100",
  "focus-visible:outline-2 data-disabled:pointer-events-none data-disabled:opacity-50",
].join(" ")

export function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
