import { Button } from "@flameware/ui/button"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import { Input } from "@flameware/ui/input"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Forms/Form",
  component: Form,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Form> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* Field들을 묶고 제출을 받는 가장 작은 모양. `onFormSubmit`은 필드 이름→값
 * 맵을 직접 받는다 — Base UI가 이름을 모아 만든다(form.tsx). */
export const Playground: Story = {
  render: () => <PlaygroundFixture />,
}

function PlaygroundFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form
      style={{ maxWidth: "20rem" }}
      onFormSubmit={(values) => setSubmitted(values)}
    >
      <Field.Root name="title">
        <Field.Label>제목</Field.Label>
        <Input required placeholder="제목을 입력하세요" />
        <Field.Error match="valueMissing">필수 항목입니다</Field.Error>
      </Field.Root>
      <Button type="submit">저장</Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

/* 서버 오류 표시 — `errors`는 필드 이름 → 오류 문자열의 맵이다. 같은 이름의
 * `Field.Root` 아래 `Field.Error`가 그 문자열을 그대로 보여준다(form.tsx). 이
 * 스토리는 제출할 때마다 서버가 "이미 쓰는 이메일입니다"를 돌려주는 것을
 * 흉내 낸다 — 필드 자체의 required·pattern 검증과는 다른 경로다. */
export const ServerErrors: Story = {
  name: "서버 오류 표시",
  render: () => <ServerErrorFixture />,
}

function ServerErrorFixture() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  return (
    <Form
      style={{ maxWidth: "20rem" }}
      errors={errors}
      onFormSubmit={() => setErrors({ email: "이미 사용 중인 이메일입니다" })}
    >
      <Field.Root name="email">
        <Field.Label>이메일</Field.Label>
        <Input type="email" placeholder="you@example.com" />
        <Field.Error />
      </Field.Root>
      <Button type="submit" data-testid="submit">
        가입
      </Button>
    </Form>
  )
}

/* 로그인 폼 — 이 티켓이 앱에 놓는 자리(로그인·회원가입)를 Storybook 안에서
 * 보여주는 조립 스토리다. 앱 컷오버 자체는 리포 밖(invest diary)의 몫이다. */
export const LoginForm: Story = {
  name: "로그인 폼",
  render: () => <LoginFixture />,
}

function LoginFixture() {
  const [count, setCount] = useState(0)
  return (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={() => setCount((n) => n + 1)}>
      <Field.Root name="login-email">
        <Field.Label>이메일</Field.Label>
        <Input data-testid="login-email" required type="email" placeholder="you@example.com" />
        <Field.Error match="valueMissing">이메일을 입력하세요</Field.Error>
      </Field.Root>
      <Field.Root name="login-password">
        <Field.Label>비밀번호</Field.Label>
        <Input data-testid="login-password" required type="password" />
        <Field.Error match="valueMissing">비밀번호를 입력하세요</Field.Error>
      </Field.Root>
      <Button type="submit" data-testid="login-submit">
        로그인 <span data-testid="login-count">{count}</span>
      </Button>
    </Form>
  )
}

/* 회원가입 폼 — 로그인과 같은 뼈대에 필드 하나가 는다. Field·Input·Form이
 * 같은 API로 둘 다 커버한다는 것이 이 스토리의 요점이지, 조립 자체가 새로운
 * DS 표면은 아니다. */
export const SignupForm: Story = {
  name: "회원가입 폼",
  render: () => (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={() => {}}>
      <Field.Root name="signup-name">
        <Field.Label>이름</Field.Label>
        <Input required placeholder="홍길동" />
        <Field.Error match="valueMissing">이름을 입력하세요</Field.Error>
      </Field.Root>
      <Field.Root name="signup-email">
        <Field.Label>이메일</Field.Label>
        <Input required type="email" placeholder="you@example.com" />
        <Field.Error match="valueMissing">이메일을 입력하세요</Field.Error>
      </Field.Root>
      <Field.Root name="signup-password">
        <Field.Label>비밀번호</Field.Label>
        <Input required type="password" />
        <Field.Description>8자 이상</Field.Description>
        <Field.Error match="valueMissing">비밀번호를 입력하세요</Field.Error>
      </Field.Root>
      <Button type="submit">가입하기</Button>
    </Form>
  ),
}

/* Tab 순서 — 로그인 폼을 그대로 재사용해 이메일 → 비밀번호 → 제출 버튼 순서를
 * 확인한다. 값을 채우지 않은 채 제출을 눌러 보는 것(암시적 제출·네이티브
 * required 검증)은 여기서 재지 않는다 — required 필드가 빈 채로 Enter를 받으면
 * 브라우저가 제출 자체를 막으므로, 그것은 이 스토리의 count가 아니라 네이티브
 * ValidityState의 몫이고 Field.stories.tsx의 Invalid가 그 자리를 이미 보여준다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 이메일 필드에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=login-email]" },
  },
  {
    name: "Tab이 비밀번호 필드로 이동한다",
    focus: "[data-testid=login-email]",
    press: ["Tab"],
    expect: { focused: "[data-testid=login-password]" },
  },
  {
    name: "Tab이 제출 버튼으로 이동한다",
    focus: "[data-testid=login-password]",
    press: ["Tab"],
    expect: { focused: "[data-testid=login-submit]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <LoginFixture />,
}
