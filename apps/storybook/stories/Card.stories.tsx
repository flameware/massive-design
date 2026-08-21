import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@massive/ui"

const meta = {
  title: "Card",
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card style={{ width: 360 }}>
      <CardHeader>
        <CardTitle>계속하려면 로그인하세요</CardTitle>
        <CardDescription>아래 계정 중 하나로 계속할 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>내용 영역</CardContent>
    </Card>
  ),
}
