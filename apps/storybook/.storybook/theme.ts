/* 매니저 테마 — Storybook의 껍데기가 DS의 색과 서체를 쓴다 (#279, 스토리 38).
 *
 * 왜 값을 손으로 적는가. 매니저는 preview iframe 밖에서 돌고 우리 `tokens.css`는
 * 그 안에만 들어간다. Storybook의 테마 API는 CSS 변수가 아니라 **값**을 받으므로
 * `var(--ds-…)`를 넘길 수 없다. 그래서 여기가 팔레트 값의 사본이 되는 유일한
 * 자리이고, 그 대가로 게이트를 세우지 않는다 — 어긋나면 문서를 여는 사람 눈에
 * 바로 보이고(사이드바 색이 브랜드가 아니게 된다), 소비처는 이 값을 쓰지 않는다.
 *
 * 값의 출처는 packages/tokens/dist/tokens.css의 semantic 정의다:
 *   brand 9 / neutral 1·2·6·12 (light) — Button이 쓰는 것과 같은 자리.
 *
 * 서체는 tokens.css의 --font-sans 스택 그대로다. Pretendard 자체는
 * manager-head.html이 불러온다. */
import { create } from "storybook/theming"

const brand9 = "#0f5fed" // --ds-bg-accent-solid (light)
const neutral1 = "#fdfdfd" // --ds-bg-surface
const neutral2 = "#f8f8f8" // --ds-bg-canvas
const neutral6 = "#d2d2d2" // --ds-border-default
const neutral12 = "#333333" // --ds-fg-default

const fontStack =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif'

export default create({
  base: "light",
  brandTitle: "massive-design",
  brandTarget: "_self",

  colorPrimary: brand9,
  colorSecondary: brand9,

  appBg: neutral2,
  appContentBg: neutral1,
  appPreviewBg: neutral1,
  appBorderColor: neutral6,
  appBorderRadius: 8, // --radius-md

  textColor: neutral12,
  textInverseColor: neutral1,

  barTextColor: neutral12,
  barSelectedColor: brand9,
  barHoverColor: brand9,
  barBg: neutral1,

  inputBg: neutral1,
  inputBorder: neutral6,
  inputTextColor: neutral12,
  inputBorderRadius: 8,

  fontBase: fontStack,
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
})
