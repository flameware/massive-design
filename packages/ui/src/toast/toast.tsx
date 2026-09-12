"use client"

import { Toast as BaseToast } from "@base-ui/react/toast"
import type {
  ToastManagerAddOptions,
  UseToastManagerReturnValue,
} from "@base-ui/react/toast"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { CloseIcon } from "../dialog/close-icon.js"
import { cn } from "../lib/utils.js"

/* Base UI 1.8.0의 ./toast 뒤에 선다(#371 — 앱에 성공 피드백 기전이 없고, 유일한
 * 손조립은 `data-management-modal.tsx`의 `setClearStatus` 상태 문자열 하나다).
 *
 * **Base UI의 모양이 앱 자리와 맞는지**(#371 AC, #325·#328과 같은 확인) — 답은
 * "맞는다"다. 앱이 필요한 것은 저장·삭제가 끝났을 때 사용자가 놓쳐도 되는 확인
 * 하나(성공)와 놓치면 안 되는 확인 하나(실패)뿐이고, `useToastManager().add()`
 * 하나로 둘 다 표현된다 — 큐·타이머·중복 억제·자동 소멸을 전부 Base UI가 진다.
 * DS가 손으로 배선하지 않은 것:
 *   - **role과 라이브 영역**: `Toast.Viewport`는 스스로 `role="region"
 *     aria-live="polite" aria-atomic="false"`를 낸다. 각 토스트(`Toast.Root`)는
 *     `role="dialog"`(`priority: "high"`면 `"alertdialog"`)다 — 놓치면 안 되는
 *     알림만 별도로 `role="alert"`(assertive) 노드에 한 번 더 실려 포커스가
 *     뷰포트 밖에 있어도 즉시 읽힌다. DS는 role을 다시 정하지 않는다.
 *   - **Esc 닫기**(#371 AC): `Toast.Root`가 keydown을 스스로 듣고 Escape에서
 *     `store.closeToast`를 부른다 — DS가 keydown 핸들러를 얹지 않는다.
 *   - **포커스를 훔치지 않음**(#371 AC): 토스트가 뜨는 순간 어디에도 초점을
 *     옮기지 않는다 — Base UI 소스 확인(`ToastRoot`에 자동 초점 호출이 없다).
 *     사용자가 Tab으로 알림 안으로 들어갈 수도 있고(추적되지 않는 진입이라
 *     닫아도 초점이 돌아오지 않는다), F6으로 뷰포트에 들어갈 수도 있다(이
 *     경우는 진입 직전 초점을 기억해 뒀다가 벗어나거나 닫으면 그 자리로
 *     돌려놓는다) — 어느 쪽이든 DS가 얹은 배선이 아니라 Base UI 내부(store)의
 *     일이다.
 *   - **옵셔널 파트가 내용이 없으면 스스로 마운트하지 않음**: `Toast.Title`·
 *     `Toast.Description`은 대응하는 `toast.title`·`toast.description`이
 *     없으면 빈 태그조차 만들지 않는다(`hasRenderableChildren`) — EmptyState가
 *     사고로 배운 것(#327→#349, 없는 파트에 `aria-describedby`를 무조건
 *     달면 안 되는 이유)이 Base UI 안에 이미 있다. 그래서 `ToastList`는 항상
 *     `<Toast.Title />`·`<Toast.Description />`·`<Toast.Action />`을 무조건
 *     렌더링해도 되고, 실제로 몇 파트가 나오는지는 호출부가 넘긴 데이터가
 *     정한다 — 조합마다 스토리 하나(#371 AC, #327→#349와 같은 규칙).
 *
 * DS가 얹는 것은 톤·면·간격·위치뿐이다(#371 AC "DS가 더한 것이 무엇인지
 * 소스 주석이 말한다"):
 *   - **톤**: `neutral`(기본)·`success`·`danger` — 이름은 `Badge`·`Alert`의
 *     이름 공간에서 고른다(ADR-0008, rules.md 축과 이름 공간). `warning`은
 *     열지 않는다 — 이 티켓이 지명한 착지 자리(저장·삭제 성공/실패, 비밀번호
 *     변경 성공) 중 "주의"에 해당하는 자리가 없다(실측 수요 0, rules.md
 *     방법론). 값은 Base UI의 범용 `type` 필드에 실어 보낸다
 *     (`ToastRootState.type`이 조건부 스타일링 용도로 이미 있는 자리다) —
 *     호출부는 `type`이 아니라 `tone`을 쓴다(`useToast().add({ tone })`).
 *     색 조합은 **대비 게이트가 이미 검증한 것만** 쓴다: `fg.default`는
 *     `bg.neutral.soft`, `fg.{danger,success}`는 각자의 `bg.{family}.soft`
 *     위에서 검증됐다(Badge와 같은 TEXT_PAIRS 목록). `success`·`neutral`
 *     둘 다 `border.success`·`border.neutral` 토큰이 없어(semantic/color.json에
 *     `border.danger`만 있다) 테두리는 `border-default`를 쓴다 — Alert의
 *     `warning` 톤과 같은 자리다.
 *   - **면**: 카드형 표면(둥근 모서리·테두리·그림자) — 뷰포트 위에 떠 있는
 *     별도 표면이라는 것을 시각적으로 분리한다.
 *   - **간격·위치**: 뷰포트는 화면 우하단에 고정하고(모바일은 좌우 여백만
 *     두고 폭 전체), 토스트 사이는 세로로 쌓인다. Base UI가 내놓는
 *     `--toast-index`·`--toast-offset-y`·`--toast-height` CSS 변수는 포개진
 *     카드가 뒤로 갈수록 작아지는 "미리보기 스택" 연출을 위한 것인데, 이
 *     티켓의 착지 자리(성공/실패 안내 하나)에는 그 연출이 필요 없어 쓰지
 *     않는다 — 평범한 세로 flex로 쌓는다(정적 변수를 참조하지 않으므로
 *     `Toast.Root`에 별도 transform이 걸리지 않는다, Base UI 소스 확인).
 *
 * 서버 컴포넌트로 남지 않는다 — Base UI의 `useToastManager`·`Toast.Provider`
 * 둘 다 상태(토스트 목록·타이머)를 다루므로 `"use client"`가 필요하다
 * (test/package.test.mjs가 "./toast"를 CLIENT_SUBPATHS로 잰다). */

export type ToastTone = "neutral" | "success" | "danger"

export const toastRootVariants = cva(
  [
    "pointer-events-auto flex w-full flex-col gap-1 rounded-lg border p-4 text-sm shadow-lg",
    "transition-[opacity,transform] duration-200 ease-out",
    "data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
    "data-[ending-style]:opacity-0",
    "data-[limited]:hidden",
  ],
  {
    variants: {
      tone: {
        neutral: "border-default bg-neutral-soft text-default",
        success: "border-default bg-success-soft text-success",
        danger: "border-danger bg-danger-soft text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export const toastViewportVariants = cva(
  "fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 outline-none sm:inset-x-auto sm:right-4 sm:w-96"
)

/** `Toast.Provider`가 하는 일 전부가 Base UI의 것이다 — DS는 아무것도 더하지
 * 않는다(타입 재수출뿐). 앱 트리 최상단 근처, `Toast.Viewport`를 감싸는
 * 자리에 한 번 둔다. */
export type ToastProviderProps = BaseToast.Provider.Props
export const Provider: React.FC<ToastProviderProps> = BaseToast.Provider

/* 닫기 아이콘(SVG)은 `dialog/close-icon.tsx`의 `CloseIcon`을 그대로 쓴다 —
 * Dialog·Drawer와 "X" 모양이 갈라지지 않도록(그 파일 자신의 주석과 같은
 * 이유). 클래스는 공유하지 않는다: `closeButtonClassName`은 전체 화면
 * 오버레이 모서리(`absolute right-4 top-4 size-6`, `p-6` 안쪽)를 위한
 * 자리인데, 토스트는 그보다 작은 카드(`p-4`)라 오프셋·크기가 다르다 —
 * 형태(아이콘)는 같고 자리(위치·치수)만 다른 경우다. 이 리터럴은
 * emission.test.mjs가 방출을 잰다(export가 그 이유다, 다른 cva 변형과
 * 같은 대우). */
const CONTENT = "relative flex flex-col gap-1 pe-6"
const TITLE = "font-medium leading-none"
const DESCRIPTION = "text-sm"
const CLOSE =
  "hit-area absolute right-3 top-3 inline-flex size-5 shrink-0 items-center justify-center rounded-sm " +
  "opacity-70 outline-offset-2 transition-opacity hover:opacity-100"
const ACTION =
  "hit-area shrink-0 self-start rounded-sm text-sm font-medium underline decoration-1 underline-offset-2 outline-offset-2 hover:no-underline"

/** ToastCard가 부르는 리터럴 클래스 전부 — cva 축이 없는 정적 문자열이라
 * emission.test.mjs가 이 그룹을 통째로 읽어 방출을 잰다(ListRow의
 * `listRowPartClassNames`·overlay.test.mjs가 Dialog·Drawer의
 * `closeButtonClassName`을 재는 것과 같은 이유 — 오타는 Tailwind에서 조용히
 * 0바이트가 된다). */
export const toastPartClassNames = { CONTENT, TITLE, DESCRIPTION, CLOSE, ACTION }

/** 토스트 하나를 그린다 — `useToastManager()`가 낸 `ToastObject`를 그대로
 * 받는다. `ToastList`(아래)가 매니저의 목록을 순회하며 부른다. 소비처가
 * 직접 이 파트들을 조립할 일은 없다 — `Toast.Viewport`가 닫힌 조립이다
 * (ConfirmDialog와 달리 되돌아갈 "파트만 조립" 경로 자체가 없다: Base UI의
 * 낱개 파트는 이 서브패스가 재수출하지 않는다 — 필요해지면 그 실측이 새
 * 티켓을 연다, rules.md 방법론).
 *
 * 닫기 아이콘(SVG)은 `dialog/close-icon.tsx`의 `CloseIcon`을 그대로 쓴다 —
 * Dialog·Drawer와 "X" 모양이 갈라지지 않도록(그 파일 자신의 주석과 같은
 * 이유). 위치·치수 클래스(`CLOSE`)는 공유하지 않는다: Dialog의
 * `closeButtonClassName`은 전체 화면 오버레이 모서리(`absolute right-4
 * top-4 size-6`, `p-6` 안쪽)를 위한 자리인데, 토스트는 그보다 작은 카드
 * (`p-4`)라 오프셋·크기가 다르다 — 형태(아이콘)는 같고 자리만 다른
 * 경우다. */
function ToastCard({ toast }: { toast: BaseToast.Root.ToastObject }) {
  const tone = (toast.type as ToastTone | undefined) ?? "neutral"
  return (
    <BaseToast.Root toast={toast} className={toastRootVariants({ tone })}>
      <div className={CONTENT}>
        <BaseToast.Title className={TITLE} />
        <BaseToast.Description className={DESCRIPTION} />
        <BaseToast.Close aria-label="닫기" className={CLOSE}>
          <CloseIcon />
        </BaseToast.Close>
      </div>
      <BaseToast.Action className={ACTION} />
    </BaseToast.Root>
  )
}

/** 매니저의 현재 토스트 목록을 그린다. `Toast.Provider` 안에서만 쓸 수 있다
 * (`useToastManager`와 같은 계약). */
function ToastList() {
  const { toasts } = BaseToast.useToastManager()
  return toasts.map((toast) => <ToastCard key={toast.id} toast={toast} />)
}

export interface ToastViewportProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToast.Viewport>, "className" | "children"> {
  className?: string
}

/** 앱 트리에 한 번 두는 뷰포트 — `Toast.Provider` 안, 보통 최상단 레이아웃의
 * 끝에 놓는다. 소비처가 만드는 것은 없다: 이 컴포넌트가 `useToastManager()`로
 * 목록을 읽고 톤에 맞춰 그린다. 새 토스트는 `useToast().add(...)`로 추가한다. */
export function Viewport({ className, ...props }: ToastViewportProps) {
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={cn(toastViewportVariants(), className)} {...props}>
        <ToastList />
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

export const Toast = { Provider, Viewport }

export interface ToastAddOptions<Data extends object = Record<string, never>>
  extends Omit<ToastManagerAddOptions<Data>, "type"> {
  /** 톤 — `Badge`·`Alert`와 같은 이름 공간(`neutral`·`success`·`danger`).
   * 기본 `neutral`. */
  tone?: ToastTone
}

export interface UseToastReturnValue<Data extends object = Record<string, never>>
  extends Omit<UseToastManagerReturnValue<Data>, "add"> {
  add: <T extends Data = Data>(options: ToastAddOptions<T>) => string
}

/** `Toast.Viewport`가 그리는 토스트를 추가·닫는다. `Toast.Provider` 안에서만
 * 쓸 수 있다(Base UI `useToastManager`와 같은 계약 — 벗어나면 Base UI가
 * 예외를 던진다, DS가 다시 잡지 않는다).
 *
 * `add()`만 `tone`을 받는다 — `close`·`update`·`promise`는 Base UI의 원래
 * 이름(`type`)을 그대로 받는다. 이 티켓이 지명한 자리(저장·삭제·비밀번호
 * 변경의 성공/실패)는 전부 "새 토스트 하나를 띄운다"이지 "떠 있는 토스트를
 * 갱신한다"가 아니다 — 실측되지 않은 자리까지 이름을 옮기지 않는다
 * (rules.md 축과 이름 공간: 축을 더하는 데는 실측된 수요가 필요하다). */
export function useToast<Data extends object = Record<string, never>>(): UseToastReturnValue<Data> {
  const manager = BaseToast.useToastManager<Data>()
  return {
    ...manager,
    add: ({ tone, ...options }) => manager.add({ ...options, type: tone ?? "neutral" }),
  }
}
