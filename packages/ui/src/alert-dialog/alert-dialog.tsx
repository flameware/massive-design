"use client"

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog"

import {
  OverlayBackdrop,
  OverlayDescription,
  OverlayPopup,
  OverlayTitle,
  OverlayViewport,
} from "../dialog/shared.js"

/**
 * 되돌릴 수 없는 결정을 확인받는 모달. Dialog와 표면(배경·테두리·그림자)을
 * 공유한다 — Base UI 자신이 `AlertDialog.Backdrop`·`Popup`·`Title`·
 * `Description`·`Viewport`를 `Dialog`의 같은 이름 그대로 재수출하기 때문이다
 * (`dialog/shared.tsx` 참고). 진짜로 다른 것은 `Root`와 `Trigger`뿐이다:
 * `AlertDialogRoot`는 `modal`·`disablePointerDismissal`을 아예 받지 않는다 —
 * 언제나 모달이고 바깥을 눌러 닫히지 않는다. 명시적 선택(취소/확인)만 닫는
 * 통로다.
 *
 * 그래서 `AlertDialog.Close`는 Dialog의 우상단 X 스타일(`OverlayClose`)을
 * 쓰지 않는다 — 얼럿에 "X로 닫기"를 두지 않는 것이 관례다. 대신 Base UI의
 * `Close`를 그대로 내보낸다: `<AlertDialog.Close render={<Button
 * variant="outline">취소</Button>} />`로 합성해 취소 버튼을 만든다. 확인
 * 버튼은 `Close`가 아니라 그냥 `Button`에 `onClick`으로 실제 동작을 걸고
 * 마지막에 닫는다(예: `actionsRef.current.close()` 또는 `onOpenChange`를
 * 문 제어와 함께 쓴다).
 *
 * 포커스 트랩·스크롤 잠금·Esc 닫기는 Dialog와 같은 이유로 Base UI가 진다.
 */
export const AlertDialog = {
  Root: BaseAlertDialog.Root,
  Trigger: BaseAlertDialog.Trigger,
  Portal: BaseAlertDialog.Portal,
  Backdrop: OverlayBackdrop,
  Viewport: OverlayViewport,
  Popup: OverlayPopup,
  Title: OverlayTitle,
  Description: OverlayDescription,
  Close: BaseAlertDialog.Close,
}
