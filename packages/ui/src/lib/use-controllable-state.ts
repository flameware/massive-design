import { useCallback, useState } from "react"

/* Toggle·ToggleGroup이 쓰는 제어/비제어 겸용 상태. Base UI의 Checkbox·Select는
 * `checked`/`value`를 스스로 제어·비제어 겸용으로 받지만, 그 값을 컴포넌트
 * 밖으로 다시 읽어 낼 방법이 없다(콜백만 준다) — 그런데 이 훅이 필요한 이유는
 * 딱 하나, Toggle·ToggleGroup에 `name`을 주면 폼에 낼 숨은 미러 입력이 "지금
 * 눌린 값이 뭔지"를 알아야 하기 때문이다(toggle.tsx). 그래서 소비처가 비제어로
 * 쓰더라도 내부적으로는 항상 이 상태를 진짜 정본으로 두고 Base UI 쪽에는
 * 그대로 내려보낸다 — 소비처가 보는 API(제어/비제어 두 갈래)는 그대로다.
 *
 * `onChange`를 이 훅이 직접 받지 않는 이유는 Base UI의 콜백(`onPressedChange`
 * 등)이 값 하나가 아니라 `(value, eventDetails)`를 주기 때문이다 — 그 모양을
 * 훅이 알면 제네릭이 깨진다. 알림은 호출부가 자기 콜백을 그대로 부르는
 * 얇은 핸들러로 겸한다(toggle.tsx·toggle-group.tsx). */
export function useControllableState<T>(params: { prop: T | undefined; defaultProp: T }): [T, (value: T) => void] {
  const { prop, defaultProp } = params
  const [uncontrolled, setUncontrolled] = useState(defaultProp)
  const isControlled = prop !== undefined
  const value = isControlled ? prop : uncontrolled

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
    },
    [isControlled]
  )

  return [value, setValue]
}
