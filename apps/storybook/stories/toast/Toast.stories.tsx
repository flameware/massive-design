import { Button } from "@flameware/ui/button"
import { Toast, useToast } from "@flameware/ui/toast"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Toast는 Base UI 뒤에 있다(#371) — role·라이브 영역·Esc 닫기·초점 관리 전부
 * `Toast.Provider`·`Toast.Viewport`가 스스로 낸다(toast.tsx 참고). 유일한
 * 노출 표면은 `Toast.Viewport`다 — 소비처가 파트를 직접 조립하지 않는
 * 닫힌 조립이라 `component`는 그것 하나다(ConfirmDialog와 같은 자리).
 *
 * 옵셔널 파트가 n개면 스토리 조합도 n개다(#327→#349): 제목만(Playground) /
 * 제목+설명(WithDescription) / 행동 있음(WithAction) 셋 다 walk한다. 톤은
 * `Tones`가 셋(neutral·success·danger) 다 보인다. */
const meta = {
  title: "Feedback/Toast",
  component: Toast.Viewport,
  parameters: { ds: { status: "stable", since: "0.5.0" } },
} satisfies Meta<typeof Toast.Viewport> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 제목만 — 앱의 유일한 손조립 자리(`data-management-modal.tsx`의
 * `setClearStatus('모든 데이터가 삭제되었습니다.')`)가 정확히 이 모양이다. */
function PlaygroundDemo() {
  const toast = useToast()
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Button onClick={() => toast.add({ title: "모든 데이터가 삭제되었습니다.", tone: "success" })}>
        삭제
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.add({ title: "데이터 삭제 중 오류가 발생했습니다.", tone: "danger" })}
      >
        삭제 실패
      </Button>
    </div>
  )
}

export const Playground: Story = {
  render: () => (
    <Toast.Provider>
      <PlaygroundDemo />
      <Toast.Viewport />
    </Toast.Provider>
  ),
}

/* 제목+설명 — 거래 저장처럼 무엇이 저장됐는지 한 줄 더 필요한 자리
 * (edit-transaction-dialog.tsx·add-transaction-dialog.tsx의 성공 경로). */
function WithDescriptionDemo() {
  const toast = useToast()
  return (
    <Button
      onClick={() =>
        toast.add({
          title: "거래를 저장했습니다",
          description: "2026-09-12 · 삼성전자 · 10주 매수",
          tone: "success",
        })
      }
    >
      거래 저장
    </Button>
  )
}

export const WithDescription: Story = {
  name: "제목+설명",
  render: () => (
    <Toast.Provider>
      <WithDescriptionDemo />
      <Toast.Viewport />
    </Toast.Provider>
  ),
}

/* 행동 있음 — 되돌릴 수 있는 일괄 동작(#356과 같은 자리, 일괄 삭제). `actionProps`는
 * Base UI가 토스트별로 받는 필드다(useToastManager.ToastObject) — `Toast.Action`이
 * 그것을 그대로 버튼에 편다. */
function WithActionDemo() {
  const toast = useToast()
  return (
    <Button
      variant="destructive"
      onClick={() =>
        toast.add({
          title: "3건을 삭제했습니다",
          description: "실행 취소는 5초 안에만 가능합니다.",
          tone: "danger",
          actionProps: { children: "실행 취소", onClick: () => {} },
        })
      }
    >
      선택 삭제
    </Button>
  )
}

export const WithAction: Story = {
  name: "행동 있음",
  render: () => (
    <Toast.Provider>
      <WithActionDemo />
      <Toast.Viewport />
    </Toast.Provider>
  ),
}

/* 톤별 — neutral(기본)·success·danger 셋 다. Alert·Badge와 같은 이름
 * 공간이고, warning은 열지 않는다(toast.tsx 주석 — 이 티켓이 지명한 자리
 * 중 "주의"에 해당하는 자리가 없다). */
function TonesDemo() {
  const toast = useToast()
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Button variant="outline" onClick={() => toast.add({ title: "변경 사항이 저장되었습니다" })}>
        neutral
      </Button>
      <Button onClick={() => toast.add({ title: "저장됐습니다", tone: "success" })}>success</Button>
      <Button variant="destructive" onClick={() => toast.add({ title: "저장하지 못했습니다", tone: "danger" })}>
        danger
      </Button>
    </div>
  )
}

export const Tones: Story = {
  name: "톤별",
  render: () => (
    <Toast.Provider>
      <TonesDemo />
      <Toast.Viewport />
    </Toast.Provider>
  ),
}

/* 키보드 계약 — 알림이 포커스를 훔치지 않음 · Esc 닫기(#371 AC). `timeout: 0`으로
 * 자동 소멸을 꺼서 계기 사이 경합을 없앤다(다른 스토리는 기본 5초를 그대로
 * 둔다 — 여기서만 타이밍이 계약의 일부이기 때문이다).
 *
 * 알림 하나를 마운트에서 미리 띄운다 — Esc 계약을 재려면 초점이 알림 **안**에
 * 있어야 하는데(Toast.Root의 keydown 핸들러가 `contains(root, activeElement)`를
 * 보고서야 닫는다, toast.tsx 참고), 계약 어휘의 `focus`는 클릭이 아니라
 * `.focus()`뿐이라 클릭으로 여는 경로를 계약 안에서 재현할 수 없다. "포커스를
 * 훔치지 않음"은 별도 버튼으로 새 알림을 하나 더 열어 재므로 서로 간섭하지
 * 않는다. */
function KeyboardDemo() {
  const toast = useToast()
  useEffect(() => {
    toast.add({ title: "포커스 확인 토스트", timeout: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Button onClick={() => toast.add({ title: "포커스 확인 토스트", timeout: 0 })}>
      토스트 보내기
    </Button>
  )
}

const keyboard: KeyboardContract[] = [
  {
    name: "Enter로 열어도 초점이 트리거에 남는다 — 알림이 포커스를 훔치지 않는다",
    focus: "role=button[name='토스트 보내기']",
    press: ["Enter"],
    expect: { focused: "role=button[name='토스트 보내기']" },
  },
  {
    // 닫기 버튼은 뷰포트가 "펼쳐진"(hover·focus로 진입한) 상태에서만
    // 접근성 트리에 드러난다(Base UI의 `aria-hidden` 배선 — 포개진 토스트가
    // 하나만 있을 때 나머지 닫기 버튼이 스크린 리더를 어지럽히지 않도록).
    // `role=` 선택자는 그 상태를 만들지 않은 채로는 이 버튼을 못 찾으므로
    // 순수 CSS 속성 선택자로 직접 초점을 준다 — 재는 것은 "알림 안에 초점이
    // 있을 때 Esc가 닫는가"(Toast.Root의 keydown)이지 이 버튼이 어떻게
    // 접근성 트리에 드러나는가(Base UI의 몫)가 아니다.
    name: "Esc가 닫는다 — 알림 안(닫기 버튼)에 초점이 있을 때",
    focus: "[aria-label='닫기']",
    press: ["Escape"],
    expect: { focused: "body" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <Toast.Provider>
      <KeyboardDemo />
      <Toast.Viewport />
    </Toast.Provider>
  ),
}
