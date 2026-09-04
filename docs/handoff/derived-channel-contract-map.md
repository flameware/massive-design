# 파생 채널이 담지 못하는 계약 맵 완료 기록

맵 [#140](https://github.com/flameware/massive-design/issues/140) · 규칙은 [`../agents/rules.md`](../agents/rules.md)

## What the map reached

The **파생 채널이 담지 못하는 계약** map ([#140](https://github.com/flameware/massive-design/issues/140)) is complete — nine tickets, `schemaVersion` 5 → 11, and modifier `unresolved` down from 145 `(component, property)` pairs to **10 keys / 17 cells, every one of them owned** (6 keys/9 cells are the map's own Out of scope, 4 keys/8 cells wait on [#155](https://github.com/flameware/massive-design/issues/155)). Four rules from it bind later work; they live under "계약이 무엇을 담고, 게이트가 무엇을 보는가" in [`../agents/rules.md`](../agents/rules.md).

## Two facts that outlive the survey

Two facts that survey turned up outlive it. **`activationMode` ships as `"automatic"`** — arrow keys move the Tabs panel on focus alone, and this contract's prose had been reasoning from `manual` for generations. **Scroll Area's scrollbar is gated on hover** (`type="hover"`, hidden 600ms after the pointer leaves) while the manifest publishes its `ScrollBar` cell and every static comp draws it always-visible — the first case where a derived channel carries a surface whose *existence* is conditional on an interaction.

## Fog the map did not chart

The map closes with fog it did not chart, and it belongs to later generations, not to a resumption of this one: how Figma draws the `configurations` [#148](https://github.com/flameware/massive-design/issues/148) put in the cells (VARIANT would multiply the set, so it carries the weight of [#24](https://github.com/flameware/massive-design/issues/24)); the declarations that must flip the moment [#155](https://github.com/flameware/massive-design/issues/155) registers parts (four `drawnBy` reasons and `switch`'s 4 keys/8 cells — count how many verdicts that generation overturns *before* running it); whether a cell without a state ladder loses its `disabled` opacity by decision or by omission; and `literal` passing values it cannot actually resolve (runtime CSS variables, and Tailwind's own composed `--tw-*` chains — 13 keys/23 cells, the same shape as the `--tw-shadow` unwrap that already exists).

Registering `parts` keeps uncovering gate violations that the missing field was hiding — `DropdownMenuSeparator` put `--ds-border-default` on `background-color` for 43 generations because its cell never reached a manifest. [#155](https://github.com/flameware/massive-design/issues/155) carries the remaining ten contracts in that state, and `select` has the same violation waiting ([#130](https://github.com/flameware/massive-design/issues/130)).
