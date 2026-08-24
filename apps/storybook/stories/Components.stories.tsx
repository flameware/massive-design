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

export const Alert = story("alert")
export const AlertDialog = story("alert-dialog")
export const Avatar = story("avatar")
export const Badge = story("badge")
export const Button = story("button")
export const Card = story("card")
export const Checkbox = story("checkbox")
export const Dialog = story("dialog")
export const DropdownMenu = story("dropdown-menu")
export const Field = story("field")
export const Input = story("input")
export const Label = story("label")
export const ListRow = story("list-row")
export const Popover = story("popover")
export const Progress = story("progress")
export const RadioGroup = story("radio-group")
export const Select = story("select")
export const Separator = story("separator")
export const Skeleton = story("skeleton")
export const Spinner = story("spinner")
export const Switch = story("switch")
export const Table = story("table")
export const Tabs = story("tabs")
export const Textarea = story("textarea")
export const Toast = story("toast")
export const Tooltip = story("tooltip")
