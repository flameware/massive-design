# 종류 ② 표면 닫기 맵 완료 기록

맵 [#165](https://github.com/flameware/massive-design/issues/165) · 규칙은 [`../agents/rules.md`](../agents/rules.md)

## What the map reached

The **종류 ② 표면 닫기** map ([#165](https://github.com/flameware/massive-design/issues/165)) is complete — twelve tickets, six surfaces opened, two ADRs, and **zero new tokens across every one of them** (eight generations running). It opened `ProgressLabel`/`ProgressValue` ([#167](https://github.com/flameware/massive-design/issues/167)), `FieldSeparator` ([#168](https://github.com/flameware/massive-design/issues/168)), `CommandSeparator` ([#169](https://github.com/flameware/massive-design/issues/169)), `TableFooter`·`InputGroupText`·`InputGroupTextarea` ([#170](https://github.com/flameware/massive-design/issues/170)), `ButtonGroupSeparator`'s `orientation` ([#171](https://github.com/flameware/massive-design/issues/171)), and Popover's Header/Title/Description ([#166](https://github.com/flameware/massive-design/issues/166)) — all thirteen surfaces confirmed to reach the derived channels, with no cell written into a contract that failed to land in a manifest.

## Its destination was not reached

**Its destination was not reached, and knowing that is the map's actual output.** [#177](https://github.com/flameware/massive-design/issues/177) ran the runbook and measured **six** remaining surfaces, not zero, against an unmoved baseline (`apps/v4/registry/bases/base/ui` is still `503a3a57aec9`, so the six were always there and were never seen). Three of them are axes upstream ships as a **prop plus `data-*` rather than `cva`**, so #162's population could not contain them — and [#176](https://github.com/flameware/massive-design/issues/176) only found that hole because writing the runbook meant **running it**. Without that, #177 would have written "0" today, exactly as [#139](https://github.com/flameware/massive-design/issues/139) inferred it. The difference between the two maps is not care; it is that this one **checked the instrument before trusting the reading**. The six go out as their own effort — a new population from a new instrument, and mixing instruments inside one map is what #121 got wrong.

## Two facts that outlive the map

Two facts that map turned up outlive it. **`SelectSeparator` still draws `h-px bg-border`** — the family violation [#130](https://github.com/flameware/massive-design/issues/130) was predicted to be waiting is really there, and `select` has no `parts` to catch it. And **`Popover.Content` renders `role="dialog"` without wiring `aria-labelledby`/`aria-describedby`**, so until [#166](https://github.com/flameware/massive-design/issues/166) it was an unnamed dialog; the fix mirrors `Dialog.Content`'s conditional wiring.
