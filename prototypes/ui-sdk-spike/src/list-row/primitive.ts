import {
  type ChangeDetails,
  createChange,
  createRovingFocus,
  createSelection,
  createTypeahead,
  definePrimitive,
  isTypeaheadKey,
  labelOf,
} from "@ui-sdk/core"

/* #496 스파이크 — "behavior를 조립해 primitive를 직접 만든다"는 주장을 재는 자리다.
 *
 * UI SDK의 기성 Listbox를 감싸지 않는다. `definePrimitive` 위에 behavior 셋
 * (`createRovingFocus`·`createSelection`·`createTypeahead`)과 `createChange`를
 * 조립해 WAI-ARIA listbox 패턴을 직접 세운다. React는 이 파일에 없다 — 파트는
 * index.tsx가 `createParts`로 만든다.
 *
 * 값은 단일 선택에서도 `string[]`다. `createSelection`이 상태를 그 모양으로
 * 요구하고("even when only one item can be chosen"), 이 저장소의 ToggleGroup도
 * 단일·다중 모두 배열이라 그대로 뒀다.
 *
 * 패턴에서 고른 것(계약은 stories/list-row의 `키보드 계약`이 잰다):
 *   - 선택이 포커스를 따라가지 않는다. 화살표는 포커스만 옮기고 Space·Enter가 고른다
 *   - 비활성 행은 포커스를 받지만 고를 수 없다 (APG "Focusability of disabled
 *     controls"가 listbox의 option에 권하는 쪽이다 — 스크린 리더가 그 행이
 *     있다는 것을 알 수 있어야 한다)
 *   - 끝에서 돌지 않는다 (패턴의 선택 사항)
 *   - 목록에 들어올 때마다 선택된 행(없으면 첫 활성 행)이 포커스를 받는다 */

export type ListRowListReason = "item-press" | "list-navigation"

export type ListRowListOptions = {
  /** 선택된 행의 `value`들. 주면 제어된다 */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], details: ChangeDetails<ListRowListReason>) => void
  /** 여러 행을 고를 수 있는가. 기본은 단일 선택이다 */
  multiple?: boolean
}

type OptionProps = { value: string; disabled?: boolean }

export const listRowList = definePrimitive({
  name: "list-row-list",
  options: {
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    multiple: "boolean",
  },
  controlled: ["value"],
  state: (options: ListRowListOptions) => ({
    value: options.value ?? options.defaultValue ?? [],
    /* 탭 정지를 가진 행의 key. roving focus가 쓴다 */
    focused: null as string | null,
    multiple: options.multiple ?? false,
  }),
  sync: (options) => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    multiple: options.multiple ?? false,
  }),
  api: (context) => {
    const change = createChange(context)
    const typeahead = createTypeahead()
    const isDisabled = (item: { props: OptionProps }) => !!item.props.disabled

    const roving = createRovingFocus<ReturnType<typeof context.store.get>, OptionProps>(context, {
      slot: "option",
      key: "focused",
      disabled: isDisabled,
      preferred: (item) => context.store.get().value.includes(item.key),
      claims: (state, item) =>
        state.value.length ? state.value.includes(item.key) : !item.props.disabled,
    })

    const selection = createSelection(context, {
      key: "value",
      set: (value, details) => change("value", value, details),
      order: () => roving.items().map((item) => item.key),
      multiple: () => context.store.get().multiple,
      selectable: (key) => !context.props<OptionProps>("option", key)?.disabled,
    })

    function select(key: string, event?: Event) {
      const details = { reason: "item-press" as const, event }
      const { multiple, focused } = context.store.get()
      if (!multiple) {
        selection.choose(key, details)
      } else if (event && "shiftKey" in event && event.shiftKey) {
        selection.extend(key, { ...details, from: focused })
      } else {
        selection.toggle(key, details)
      }
    }

    return {
      roving,
      select,
      /* 포커스가 목록을 떠나면 탭 정지를 선택된 행(없으면 첫 활성 행)으로 되돌린다.
       * roving focus는 `remember: true`면 마지막으로 포커스된 행에, `false`면 늘
       * 선호 행에 정지를 둔다. 뒤쪽은 선택이 포커스를 따라가지 않는 목록에서
       * 탭 정지와 실제 포커스가 갈려 Shift+Tab이 목록 안에 갇힌다. 그래서 앞쪽을
       * 쓰고, 떠날 때만 손으로 되돌린다 */
      settle() {
        const { value } = context.store.get()
        const items = roving.items()
        const enabled = items.filter((item) => !isDisabled(item))
        const target = enabled.find((item) => value.includes(item.key)) ?? enabled[0] ?? items[0]
        if (target) roving.remember(target.key)
      },
      keydown(event: KeyboardEvent) {
        if (event.defaultPrevented) return
        const from = roving.items().find((item) => item.el === event.target)
        if (!from) return
        const { multiple } = context.store.get()

        const moved = roving.keydown(event, from.el)
        if (moved) {
          if (multiple && moved.shift) {
            selection.extend(moved.key, { from: moved.from, reason: "list-navigation", event })
          }
          return
        }
        if (event.key === "Enter" || (event.key === " " && !typeahead.active())) {
          event.preventDefault()
          select(from.key, event)
          return
        }
        if (multiple && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
          event.preventDefault()
          selection.toggleAll({ reason: "list-navigation", event })
          return
        }
        if (!isTypeaheadKey(event)) return
        /* 타이핑 중의 Space는 검색어의 일부다 — 페이지가 스크롤되지 않게만 막는다 */
        if (event.key === " ") event.preventDefault()
        const items = roving.items()
        const match =
          items[
            typeahead(
              event.key,
              items.map((item) => labelOf(item.el)),
              items.findIndex((item) => item.key === from.key)
            )
          ]
        if (match) roving.focus(match.key)
      },
    }
  },
  slots: (slot) => ({
    root: slot({
      role: "listbox",
      keys: ["ArrowUp", "ArrowDown", "Home", "End", "Enter", " ", "typeahead"],
      attrs: (state) => ({
        "aria-multiselectable": state.multiple ? "true" : undefined,
      }),
      on: {
        /* 행의 keydown이 여기까지 올라온다 — 행마다 핸들러를 달지 않는다 */
        keydown: (event, { api }) => api.keydown(event),
        focusout: (event, { el, api }) => {
          const next = event.relatedTarget
          const stays = next instanceof Node && !!el?.contains(next)
          /* 창이 포커스를 잃은 것은 목록을 떠난 것이 아니다 */
          if (!stays && el?.ownerDocument.hasFocus()) api.settle()
        },
      },
    }),
    option: slot<OptionProps, { selected: boolean; disabled: boolean }>({
      props: { value: "string", disabled: "boolean" },
      role: "option",
      focus: "roving",
      press: ({ api, key }, event) => api.select(key, event),
      state: (state, part) => ({
        selected: state.value.includes(part.key),
        disabled: !!part.props.disabled,
      }),
      attrs: (state, part) => ({
        "aria-selected": String(state.value.includes(part.key)),
        "aria-disabled": part.props.disabled ? "true" : undefined,
        tabindex: part.api.roving.tabIndex(state, part),
        "data-selected": state.value.includes(part.key) ? "" : undefined,
        "data-disabled": part.props.disabled ? "" : undefined,
      }),
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
})
