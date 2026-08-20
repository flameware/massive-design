// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 06 — Effect Style 5개
// use_figma의 code 파라미터에 그대로 넣는다. IIFE로 감싸지 말 것 — 이미 async 컨텍스트다.

// 그림자 색은 변수화하지 않고 리터럴 RGBA로 둔다 — 단계마다 알파가 달라
// 변수화하면 그림자 밖에서 쓸 일 없는 색 primitive가 5개 는다 (scale-tokens.md §5.3).
// 라이트/다크 한 벌이다. 다크 elevation은 그림자가 아니라 border가 표현한다.

// [이름, 레이어들]
const SHADOWS = [
  ["shadow/xs",[{"x":0,"y":1,"radius":2,"spread":0,"alpha":0.05}]],
  ["shadow/sm",[{"x":0,"y":1,"radius":3,"spread":0,"alpha":0.08},{"x":0,"y":1,"radius":2,"spread":-1,"alpha":0.08}]],
  ["shadow/md",[{"x":0,"y":4,"radius":6,"spread":-1,"alpha":0.1},{"x":0,"y":2,"radius":4,"spread":-2,"alpha":0.1}]],
  ["shadow/lg",[{"x":0,"y":10,"radius":15,"spread":-3,"alpha":0.12},{"x":0,"y":4,"radius":6,"spread":-4,"alpha":0.12}]],
  ["shadow/xl",[{"x":0,"y":20,"radius":25,"spread":-5,"alpha":0.16},{"x":0,"y":8,"radius":10,"spread":-6,"alpha":0.16}]],
]

const existing = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s]))
const touched = []

for (const [name, layers] of SHADOWS) {
  const es = existing.get(name) ?? figma.createEffectStyle()
  es.name = name
  // effects는 read-only 배열이라 통째로 재할당한다 (#4)
  es.effects = layers.map((l) => ({
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: l.alpha },
    offset: { x: l.x, y: l.y },
    radius: l.radius,
    spread: l.spread,
    visible: true,
    blendMode: 'NORMAL',
  }))
  touched.push(name)
}

return { count: touched.length, styles: touched }
