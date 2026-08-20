/**
 * semantic 조합의 대비 게이트.
 *
 * **WCAG 2 AA가 게이트, APCA는 병기**(build-pipeline.md §4.4). APCA로 게이트하지
 * 않는 이유는 그게 아직 WCAG 3 드래프트이고 소비처의 접근성 요구가 실제로 걸리는
 * 기준은 AA이기 때문이다. 병기는 나중에 게이트를 옮길 때의 기준선 데이터다.
 *
 * 조합 목록은 이 파일이 **명시 열거**한다. 전 조합 곱집합은 의미 없는 쌍(툴팁
 * 배경 위 본문 텍스트 같은)을 잔뜩 만들어 최저값을 엉뚱한 데서 끌어온다.
 */
import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { fileURLToPath } from 'node:url'

import { ROOT, loadSources } from './build.mjs'
import { resolve } from './lib/resolve.mjs'

const MODES = ['light', 'dark']

/** 면 — 텍스트가 놓일 수 있는 배경. */
const SURFACES = ['bg.canvas', 'bg.surface', 'bg.subtle', 'bg.inset', 'bg.overlay']
const SOFTS = { accent: 'bg.accent.soft', danger: 'bg.danger.soft', success: 'bg.success.soft' }

/** [전경, 배경] — 텍스트. 4.5:1 게이트. */
const TEXT_PAIRS = [
  ...SURFACES.map((bg) => ['fg.default', bg]),
  ...SURFACES.map((bg) => ['fg.muted', bg]),
  ['fg.default', 'bg.neutral.soft'],
  ['fg.muted', 'bg.neutral.soft'],
  // 유채 텍스트는 중립 면 + 자기 패밀리의 soft 위에서만 쓴다
  ...['accent', 'danger', 'success'].flatMap((f) => [
    [`fg.${f}`, 'bg.canvas'], [`fg.${f}`, 'bg.surface'], [`fg.${f}`, 'bg.subtle'],
    [`fg.${f}`, SOFTS[f]],
  ]),
  ['fg.link', 'bg.canvas'], ['fg.link', 'bg.surface'], ['fg.link', 'bg.subtle'],
  // 단일 on-solid 토큰이 4패밀리 solid 전부에서 성립하는지 — 최저값이 여기서 나온다
  ...['neutral', 'accent', 'danger', 'success'].map((f) => ['fg.on-solid', `bg.${f}.solid`]),
  ['fg.on-inverse', 'bg.inverse'],
]

/**
 * [전경, 배경] — 비텍스트. 3:1 게이트.
 *
 * 게이트 대상은 **캔버스 위의 인터랙티브 테두리 3종**이다(#7이 확정한 6조합 =
 * 3 × 2모드, 최저 3.04). `border.default` · `border.field`는 제외한다 — 요건은
 * "상태를 나타내는 UI 컴포넌트"에 걸리고 구분선은 그 대상이 아니다. 다크에서
 * 알파 합성이라 값도 1.31까지 내려간다(semantic-tokens.md §8).
 */
const NONTEXT_PAIRS = ['border.accent', 'border.danger', 'border.focus']
  .map((fg) => [fg, 'bg.canvas'])

/**
 * 게이트하지 않고 **표에만 싣는** 조합. 카드 위 포커스 링처럼 실제로 쓰이지만
 * #7의 6조합에 없던 쌍이다. 여기를 게이트로 올리는 것은 값을 바꾸는 결정이라
 * 이 티켓의 범위 밖이다 — 다크 `border.focus` on `bg.surface`가 2.84로 떨어진다.
 */
const NONTEXT_WATCH = ['border.strong', 'border.accent', 'border.danger', 'border.focus']
  .map((fg) => [fg, 'bg.surface'])
  .concat([['border.strong', 'bg.canvas']])

// ── 계산 ────────────────────────────────────────────────────────────────────

const srgb = (hex) => {
  const h = hex.replace('#', '')
  const at = (i) => parseInt(h.slice(i, i + 2), 16)
  return { r: at(0), g: at(2), b: at(4), a: h.length === 8 ? at(6) / 255 : 1 }
}

/** 알파가 있는 색은 배경 위에 합성해야 대비값이 의미를 갖는다. */
function composite(fg, bg) {
  if (fg.a === 1) return fg
  const mix = (c) => Math.round(fg[c] * fg.a + bg[c] * (1 - fg.a))
  return { r: mix('r'), g: mix('g'), b: mix('b'), a: 1 }
}

const channel = (v) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const luminance = ({ r, g, b }) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export function wcag(fgHex, bgHex) {
  const bg = srgb(bgHex)
  const fg = composite(srgb(fgHex), bg)
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}

export function apca(fgHex, bgHex) {
  const bg = srgb(bgHex)
  const fg = composite(srgb(fgHex), bg)
  const y = ({ r, g, b }) => sRGBtoY([r, g, b])
  return Math.abs(APCAcontrast(y(fg), y(bg)))
}

export function report(root = ROOT) {
  const { tokens } = loadSources(root)
  const hex = (name, mode) => resolve(tokens, `color.${name}`, mode).value

  const rows = []
  for (const mode of MODES) {
    const groups = [
      ['text', TEXT_PAIRS, 4.5, true],
      ['nontext', NONTEXT_PAIRS, 3, true],
      ['nontext(참고)', NONTEXT_WATCH, 3, false],
    ]
    for (const [kind, pairs, gate, gated] of groups) {
      for (const [fg, bg] of pairs) {
        const cr = wcag(hex(fg, mode), hex(bg, mode))
        rows.push({ mode, kind, gated, fg, bg, gate, cr, apca: apca(hex(fg, mode), hex(bg, mode)) })
      }
    }
  }
  return rows
}

function main() {
  const rows = report()
  const failed = rows.filter((r) => r.gated && r.cr < r.gate)

  const pad = (s, n) => String(s).padEnd(n)
  console.log(`${pad('mode', 6)}${pad('전경', 16)}${pad('배경', 20)}${pad('CR', 8)}${pad('APCA', 8)}판정`)
  for (const r of rows) {
    const verdict = r.cr >= r.gate ? '✓' : r.gated ? `✗ < ${r.gate}` : `⚠ < ${r.gate} (참고)`
    console.log(
      pad(r.mode, 6) + pad(r.fg, 16) + pad(r.bg, 20) +
      pad(r.cr.toFixed(2), 8) + pad(r.apca.toFixed(1), 8) + verdict,
    )
  }

  for (const kind of ['text', 'nontext', 'nontext(참고)']) {
    const of = rows.filter((r) => r.kind === kind)
    const min = of.reduce((a, b) => (a.cr < b.cr ? a : b))
    console.log(`\n${kind} ${of.length}조합 (${of[0].gated ? '게이트' : '표시만'} ${of[0].gate}:1) — ` +
      `최저 ${min.cr.toFixed(2)} (${min.mode} ${min.fg} on ${min.bg})`)
  }

  if (failed.length) {
    console.error(`\n대비 게이트 실패 — ${failed.length}건`)
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
