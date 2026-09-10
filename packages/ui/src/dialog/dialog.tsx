"use client"

import { Dialog as BaseDialog } from "@base-ui/react/dialog"

import {
  OverlayBackdrop,
  OverlayClose,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
  OverlayViewport,
} from "./shared.js"

/**
 * 가운데 뜨는 모달. 네임스페이스형이다(ADR-0023 §5) — Base UI 문서와 1:1이라
 * 학습 비용이 없다: `Dialog.Root` 안에 `Dialog.Trigger`를 두고,
 * `Dialog.Portal` 안에 `Dialog.Backdrop`과 `Dialog.Viewport > Dialog.Popup`을
 * 둔다.
 *
 * 포커스 트랩·스크롤 잠금·Esc 닫기는 **Base UI의 일**이다 — `Root`의 `modal`
 * 기본값이 `true`라 셋 다 열림 중에 걸린다: 포커스가 안으로 트랩되고
 * (Tab이 밖으로 새지 않는다), `document`의 스크롤이 잠기고, `Escape`가 닫으며
 * 닫히면 포커스가 트리거로 돌아온다(`Popup`의 `finalFocus` 기본값). 이 패키지는
 * 그 위에 표면(배경·테두리·그림자)만 칠한다 — 계약은 Dialog.stories.tsx의
 * `Keyboard` 스토리가 Playwright로 그대로 잰다.
 *
 * `Trigger`는 일부러 스타일이 없다 — Button처럼 `render`를 받는 자리라
 * `<Dialog.Trigger render={<Button variant="outline" />}>`로 조립한다
 * (button.tsx가 이미 보여준 합성이 여기서도 그대로 통한다).
 *
 * 데스크톱/모바일 전환(Dialog ↔ Drawer)은 이 패키지의 몫이 아니다 — #284의
 * 결정대로 앱이 자기 `useIsMobile`로 어느 쪽을 렌더할지 고른다(프리셋은
 * 반복이 확인된 뒤, ADR-0023 §5).
 */
export const Dialog = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Backdrop: OverlayBackdrop,
  Viewport: OverlayViewport,
  Popup: OverlayPopup,
  Title: OverlayTitle,
  Description: OverlayDescription,
  Close: OverlayClose,
}
