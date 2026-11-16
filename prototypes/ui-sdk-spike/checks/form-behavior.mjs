/* #496 — Form·Field의 **동작**을 원본(Base UI)과 스파이크(UI SDK)에서 같은 걸음으로
 * 재어 나란히 적는다. stories.test.mjs는 axe·히트 영역·Tab 순서만 재므로, 검증
 * 흐름(빈 제출·서버 오류·aria 연결)은 여기서 따로 본다.
 *
 *   node checks/form-behavior.mjs
 *
 * 원본은 apps/storybook/storybook-static, 스파이크는 runs/form·runs/field의 빌드다. */
import path from "node:path"
import { chromium } from "playwright"

import { open, serve } from "./serve.mjs"

const here = import.meta.dirname
const builds = {
  "원본(Base UI)": { form: path.resolve(here, "../../../apps/storybook/storybook-static"), field: path.resolve(here, "../../../apps/storybook/storybook-static") },
  "스파이크(UI SDK)": { form: path.resolve(here, "../runs/form/storybook-static"), field: path.resolve(here, "../runs/field/storybook-static") },
}

const browser = await chromium.launch()
const results = {}

/* 화면에 보이는 오류 문구 — 색으로 찾는다(두 구현 모두 text-danger다) */
const visibleErrors = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll(".text-danger")]
      .filter((el) => el.getClientRects().length > 0 && el.textContent.trim())
      .map((el) => el.textContent.trim())
  )
const focusedId = (page) =>
  page.evaluate(() => document.activeElement?.getAttribute("data-testid") ?? document.activeElement?.tagName ?? null)
/* 컨트롤의 접근 가능한 이름·설명을 브라우저가 계산한 그대로 읽는다 */
const a11y = async (page, selector) => {
  const el = page.locator(selector).first()
  const snapshot = await el.evaluate((node) => ({
    invalid: node.getAttribute("aria-invalid"),
    disabled: node.disabled,
    describedby: (node.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? `(없는 id ${id})`),
    labelledby: (node.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? `(없는 id ${id})`),
    labels: [...(node.labels ?? [])].map((label) => label.textContent.trim()),
  }))
  return snapshot
}

for (const [name, dirs] of Object.entries(builds)) {
  const out = (results[name] = {})
  const form = await serve(dirs.form)
  const field = dirs.field === dirs.form ? form : await serve(dirs.field)
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  // 1. 로그인 폼 — 빈 채 제출
  await open(page, form.port, "forms-form--login-form")
  await page.click("[data-testid=login-submit]")
  await page.waitForTimeout(150)
  out["로그인: 빈 제출 뒤 보이는 오류"] = await visibleErrors(page)
  out["로그인: 빈 제출 뒤 포커스"] = await focusedId(page)
  out["로그인: 빈 제출 뒤 count"] = await page.textContent("[data-testid=login-count]")
  out["로그인: 빈 제출 뒤 이메일 aria"] = await a11y(page, "[data-testid=login-email]")
  // 값을 고치면 오류가 걷히는가
  await page.fill("[data-testid=login-email]", "a@b.co")
  await page.waitForTimeout(100)
  out["로그인: 이메일만 채운 뒤 보이는 오류"] = await visibleErrors(page)
  await page.fill("[data-testid=login-password]", "secret12")
  await page.click("[data-testid=login-submit]")
  await page.waitForTimeout(150)
  out["로그인: 채우고 제출 뒤 count"] = await page.textContent("[data-testid=login-count]")
  out["로그인: 채우고 제출 뒤 보이는 오류"] = await visibleErrors(page)
  // Enter로 암시적 제출
  await page.focus("[data-testid=login-password]")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(150)
  out["로그인: Enter 제출 뒤 count"] = await page.textContent("[data-testid=login-count]")

  // 2. Playground — onFormSubmit이 받는 값
  await open(page, form.port, "forms-form--playground")
  await page.fill("input", "메모")
  await page.click("button[type=submit]")
  await page.waitForTimeout(150)
  out["Playground: onFormSubmit 값"] = await page.textContent("[data-testid=submitted]").catch(() => null)

  // 3. 서버 오류
  await open(page, form.port, "forms-form--server-errors")
  await page.fill("input", "a@b.co")
  await page.click("[data-testid=submit]")
  await page.waitForTimeout(150)
  out["서버 오류: 제출 뒤 보이는 오류"] = await visibleErrors(page)
  out["서버 오류: 제출 뒤 입력 aria"] = await a11y(page, "input")
  out["서버 오류: 제출 뒤 포커스가 입력에 있다"] = await page.evaluate(() => document.activeElement?.tagName === "INPUT")
  // 포커스를 옮기지 않고 그대로 친다 — 오류가 온 뒤 사용자가 하는 그대로다
  await page.keyboard.type("c@d.co")
  await page.waitForTimeout(150)
  out["서버 오류: 값을 고친 뒤 입력값"] = await page.inputValue("input")
  out["서버 오류: 값을 고친 뒤 보이는 오류"] = await visibleErrors(page)
  out["서버 오류: 값을 고친 뒤 aria-invalid"] = (await a11y(page, "input")).invalid
  await page.click("[data-testid=submit]")
  await page.waitForTimeout(150)
  out["서버 오류: 다시 제출 뒤 보이는 오류"] = await visibleErrors(page)
  // 형식이 틀린 이메일 — 네이티브 typeMismatch
  await open(page, form.port, "forms-form--server-errors")
  await page.fill("input", "형식아님")
  await page.click("[data-testid=submit]")
  await page.waitForTimeout(150)
  out["서버 오류: 형식 틀린 값 제출 뒤 보이는 오류"] = await visibleErrors(page)

  // 4. Field — aria 연결
  await open(page, field.port, "forms-field--playground")
  out["Field Playground: 입력 aria"] = await a11y(page, "input")
  await page.click("label")
  out["Field Playground: 라벨을 누르면 입력에 포커스"] = await page.evaluate(() => document.activeElement?.tagName === "INPUT")
  await open(page, field.port, "forms-field--invalid")
  out["Field Invalid: 보이는 오류"] = await visibleErrors(page)
  out["Field Invalid: 입력 aria"] = await a11y(page, "input")
  await open(page, field.port, "forms-field--disabled")
  out["Field Disabled: 입력 aria"] = await a11y(page, "input")
  await open(page, field.port, "forms-field--controlled-seam")
  await page.fill("[data-testid=controlled-input]", "seongki")
  out["Field 제어 통로: echo"] = await page.textContent("[data-testid=controlled-echo]")

  // 5. 스파이크 전용 — 실제 React Hook Form
  if (name.startsWith("스파이크")) {
    await open(page, form.port, "forms-form--react-hook-form")
    await page.click("[data-testid=rhf-submit]")
    await page.waitForTimeout(150)
    out["RHF: 빈 제출 뒤 오류"] = await visibleErrors(page)
    out["RHF: 빈 제출 뒤 포커스"] = await focusedId(page)
    out["RHF: 빈 제출 뒤 입력 aria"] = await a11y(page, "[data-testid=rhf-input]")
    await page.fill("[data-testid=rhf-input]", "ab")
    await page.click("[data-testid=rhf-submit]")
    await page.waitForTimeout(150)
    out["RHF: 'ab' 제출 뒤 오류"] = await visibleErrors(page)
    await page.fill("[data-testid=rhf-input]", "abc")
    await page.waitForTimeout(150)
    out["RHF: 'abc'로 고친 뒤 오류"] = await visibleErrors(page)
    await page.click("[data-testid=rhf-submit]")
    await page.waitForTimeout(150)
    out["RHF: 'abc' 제출 값"] = await page.textContent("[data-testid=rhf-submitted]")
  }

  await page.close()
  form.server.close()
  if (field !== form) field.server.close()
}
await browser.close()

const [a, b] = Object.keys(results)
const keys = [...new Set([...Object.keys(results[a]), ...Object.keys(results[b])])]
let differences = 0
for (const key of keys) {
  const left = JSON.stringify(results[a][key])
  const right = JSON.stringify(results[b][key])
  const same = left === right
  if (!same && left !== undefined) differences++
  console.log(`${same ? "=" : left === undefined ? "+" : "≠"} ${key}`)
  if (same) console.log(`    ${left}`)
  else {
    if (left !== undefined) console.log(`    ${a}: ${left}`)
    console.log(`    ${b}: ${right}`)
  }
}
console.log(`\n다른 항목 ${differences}개 (≠), 스파이크 전용 ${keys.filter((k) => results[a][k] === undefined).length}개 (+)`)
