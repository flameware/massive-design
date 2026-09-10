import { Field } from "@flameware/ui/field"
import { Input } from "@flameware/ui/input"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Field.Root가 진짜 컴포넌트다 — Label·Description·Error는 그 컨텍스트를
 * 읽는 자식일 뿐이라 각자 독립된 스토리 파일을 갖지 않는다(button.tsx의
 * `render`처럼, 이 조립 자체가 Field의 API다). Input을 컨트롤로 쓰는 이유는
 * Field 혼자로는 화면에 아무것도 그려지지 않기 때문이지, Field가 Input에
 * 의존해서가 아니다 — Textarea·Select 등 어떤 컨트롤을 넣어도 같은 배선이 돈다 */
const meta = {
  title: "Forms/Field",
  component: Field.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { name: "email", disabled: false, invalid: false },
  argTypes: {
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof Field.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 라벨·설명·오류가 aria로 자동 연결되는 것이 이 컴포넌트의 요점이다. 눈으로는
 * 안 보이고 접근성 트리에서만 보인다 — axe가 그 트리를 읽는다(스토리 테스트).
 * `args`를 그대로 Field.Root에 펼쳐 Controls가 `disabled`·`invalid`를 실제로
 * 흔들어 보게 한다 — 문서 페이지의 props 표가 여기서 난다. */
export const Playground: Story = {
  render: (args) => (
    <Field.Root {...args} style={{ maxWidth: "20rem" }}>
      <Field.Label>이메일</Field.Label>
      <Input type="email" placeholder="you@example.com" />
      <Field.Description>가입에 사용한 이메일 주소</Field.Description>
      <Field.Error match={args.invalid || undefined}>이메일 형식이 올바르지 않습니다</Field.Error>
    </Field.Root>
  ),
}

/* `invalid`를 Field.Root에 직접 넘기면 그 상태가 외부(RHF 등)의 것으로 표시된다
 * — 실제 제출·blur 없이도 오류 자리를 볼 수 있다. `Field.Error`의 `match`를
 * `true`로 주면 네이티브 ValidityState 대신 그 값을 그대로 따른다. */
export const Invalid: Story = {
  render: () => (
    <Field.Root name="password" invalid touched style={{ maxWidth: "20rem" }}>
      <Field.Label>비밀번호</Field.Label>
      <Input type="password" />
      <Field.Error match>8자 이상이어야 합니다</Field.Error>
    </Field.Root>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Field.Root name="nickname" disabled style={{ maxWidth: "20rem" }}>
      <Field.Label>닉네임</Field.Label>
      <Input placeholder="변경할 수 없음" />
      <Field.Description>가입 뒤에는 바꿀 수 없습니다</Field.Description>
    </Field.Root>
  ),
}

/* RHF의 `Controller`가 넘기는 것은 `value`·`onChange`·`onBlur`·`ref`뿐이고,
 * Base UI 쪽은 그것을 `value`·`onValueChange`·`onBlur`·`ref`로 받는다(공식
 * 문서 예제와 같은 이름). DS는 RHF를 의존하지 않으므로 여기서는 RHF 없이 같은
 * 통로(제어 props + ref)를 손으로 흉내 낸다 — 이 스토리가 통과하면 Controller가
 * 그 자리에 그대로 들어갈 수 있다는 뜻이다. */
export const ControlledSeam: Story = {
  name: "제어 통로 (RHF 없이)",
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [value, setValue] = useState("")
  return (
    <Field.Root name="handle" style={{ maxWidth: "20rem" }}>
      <Field.Label>아이디</Field.Label>
      <Input
        data-testid="controlled-input"
        value={value}
        onValueChange={(next) => setValue(next)}
      />
      <Field.Description data-testid="controlled-echo">입력값: {value || "(비어 있음)"}</Field.Description>
    </Field.Root>
  )
}

/* Tab 순서 — AC의 "Tab 순서"가 여기서 실제로 눌려 재진다. 두 번째 Field는
 * disabled라 Tab이 건너뛴다(Input이 disabled를 Field.Root에서 물려받는다). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 첫 필드의 컨트롤에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=first]" },
  },
  {
    name: "disabled 필드는 Tab이 건너뛴다",
    focus: "[data-testid=first]",
    press: ["Tab"],
    expect: { focused: "[data-testid=third]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "20rem" }}>
      <Field.Root name="first">
        <Field.Label>첫 필드</Field.Label>
        <Input data-testid="first" />
      </Field.Root>
      <Field.Root name="second" disabled>
        <Field.Label>둘째 필드 (비활성)</Field.Label>
        <Input data-testid="second" />
      </Field.Root>
      <Field.Root name="third">
        <Field.Label>셋째 필드</Field.Label>
        <Input data-testid="third" />
      </Field.Root>
    </div>
  ),
}
