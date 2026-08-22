/* 매니페스트에 담기는 컴포넌트 목록.
 *
 * 축은 여기 적지 않는다 — 컴포넌트가 내보내는 cva config가 그대로 축이다.
 * 손으로 적으면 verify가 원리적으로 못 잡는 사본이 된다(#22 §7). */
import { buttonVariants, buttonVariantsConfig } from "../../src/components/ui/button.tsx"
import { cardVariants, cardVariantsConfig } from "../../src/components/ui/card.tsx"
import { labelVariants, labelVariantsConfig } from "../../src/components/ui/label.tsx"
import { tableVariants, tableVariantsConfig } from "../../src/components/ui/table.tsx"
import { listRowVariants, listRowVariantsConfig } from "../../src/components/ui/list-row.tsx"
import { badgeVariants, badgeVariantsConfig } from "../../src/components/ui/badge.tsx"
import { inputVariants, inputVariantsConfig } from "../../src/components/ui/input.tsx"
import { checkboxVariants, checkboxVariantsConfig } from "../../src/components/ui/checkbox.tsx"
import { selectVariants, selectVariantsConfig } from "../../src/components/ui/select.tsx"
import { dropdownMenuVariants, dropdownMenuVariantsConfig } from "../../src/components/ui/dropdown-menu.tsx"
import { cn } from "../../src/lib/utils.ts"

export const COMPONENTS = [
  {
    name: "button",
    source: "src/components/ui/button.tsx",
    config: buttonVariantsConfig,
    // 실제 렌더와 같은 경로를 탄다 — cva가 이어 붙이고 tailwind-merge가 정리한다
    className: (props) => cn(buttonVariants(props)),
  },
  {
    name: "card",
    source: "src/components/ui/card.tsx",
    config: cardVariantsConfig,
    className: (props) => cn(cardVariants(props)),
  },
  {
    name: "label",
    source: "src/components/ui/label.tsx",
    config: labelVariantsConfig,
    className: (props) => cn(labelVariants(props)),
  },
  {
    name: "table", source: "src/components/ui/table.tsx", config: tableVariantsConfig,
    className: (props) => cn(tableVariants(props)),
    anatomy: ["Table", "TableHeader", "TableBody", "TableRow*", "TableHead*", "TableCell*", "TableCaption?"],
    configurationStates: { row: ["default", "selected"] },
  },
  {
    name: "list-row", source: "src/components/ui/list-row.tsx", config: listRowVariantsConfig,
    className: (props) => cn(listRowVariants(props)),
    anatomy: ["ListRow", "ListRowLeading?", "ListRowContent", "ListRowTitle", "ListRowDescription?", "ListRowMeta?", "ListRowTrailing?"],
    configurationStates: { row: ["default", "selected"] },
  },
  {
    name: "badge", source: "src/components/ui/badge.tsx", config: badgeVariantsConfig,
    className: (props) => cn(badgeVariants(props)), anatomy: ["Badge"],
  },
  {
    name: "input", source: "src/components/ui/input.tsx", config: inputVariantsConfig,
    className: (props) => cn(inputVariants(props)), anatomy: ["Input"],
  },
  {
    name: "checkbox", source: "src/components/ui/checkbox.tsx", config: checkboxVariantsConfig,
    className: (props) => cn(checkboxVariants(props)), anatomy: ["Checkbox", "Indicator"],
    configurationStates: { checked: ["unchecked", "checked", "indeterminate"] },
  },
  {
    name: "select", source: "src/components/ui/select.tsx", config: selectVariantsConfig,
    className: (props) => cn(selectVariants(props)),
    anatomy: ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectGroup*", "SelectLabel?", "SelectItem*", "SelectSeparator?"],
    configurationStates: { open: ["closed", "open"] },
  },
  {
    name: "dropdown-menu", source: "src/components/ui/dropdown-menu.tsx", config: dropdownMenuVariantsConfig,
    className: (props) => cn(dropdownMenuVariants(props)),
    anatomy: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuGroup*", "DropdownMenuLabel?", "DropdownMenuItem*", "DropdownMenuSeparator?"],
    configurationStates: { open: ["closed", "open"] },
  },
]
