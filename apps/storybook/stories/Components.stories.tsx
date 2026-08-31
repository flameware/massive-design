/* GENERATED from @massive/ui manifests. Do not edit. */
import type { Meta, StoryObj } from "@storybook/react-vite"
import { CatalogReference } from "./CatalogReference"
import { catalog } from "./catalog.gen"

const meta = { title: "Components/Manifest references", parameters: { layout: "fullscreen" } } satisfies Meta<Record<string, string>>
export default meta
type Story = StoryObj<Record<string, string>>

function story(component: (typeof catalog)[number]["component"]): Story {
  const entry = catalog.find((item) => item.component === component)!
  const controls = { ...entry.axes, ...entry.configurationStates } as Record<string, readonly string[]>
  const args = Object.fromEntries(Object.entries(controls).map(([axis, values]) => [axis, values[0]]))
  return {
    args,
    argTypes: Object.fromEntries(Object.entries(controls).map(([axis, values]) => [axis, { control: "select", options: values }])),
    render: (selection) => <CatalogReference entry={entry} selection={selection}/>,
  }
}

export const Accordion = story("accordion")
export const Alert = story("alert")
export const AlertDialog = story("alert-dialog")
export const Avatar = story("avatar")
export const Badge = story("badge")
export const Breadcrumb = story("breadcrumb")
export const Button = story("button")
export const ButtonGroup = story("button-group")
export const Calendar = story("calendar")
export const Card = story("card")
export const Checkbox = story("checkbox")
export const Collapsible = story("collapsible")
export const Combobox = story("combobox")
export const Command = story("command")
export const Dialog = story("dialog")
export const DropdownMenu = story("dropdown-menu")
export const Empty = story("empty")
export const Field = story("field")
export const Input = story("input")
export const InputGroup = story("input-group")
export const InputOtp = story("input-otp")
export const Item = story("item")
export const Kbd = story("kbd")
export const Label = story("label")
export const ListRow = story("list-row")
export const NativeSelect = story("native-select")
export const Pagination = story("pagination")
export const Popover = story("popover")
export const Progress = story("progress")
export const RadioGroup = story("radio-group")
export const Resizable = story("resizable")
export const ScrollArea = story("scroll-area")
export const Select = story("select")
export const Separator = story("separator")
export const Sheet = story("sheet")
export const Sidebar = story("sidebar")
export const Skeleton = story("skeleton")
export const Slider = story("slider")
export const Spinner = story("spinner")
export const Switch = story("switch")
export const Table = story("table")
export const Tabs = story("tabs")
export const Textarea = story("textarea")
export const Toast = story("toast")
export const Toggle = story("toggle")
export const ToggleGroup = story("toggle-group")
export const Tooltip = story("tooltip")
