/* Foundations 챕터가 읽는 원본. 값을 손으로 베끼지 않고 scale.json을 그대로
 * import한다 — @flameware/tokens는 이 값들을 런타임 API로 내지 않는다(색만
 * `cssVar`·`palette`로 낸다, ADR-0017 바닥값: 쓰지 않는 소비처가 지지 않을
 * 무게를 늘리지 않으려고 타이포·간격·라운드는 CSS 출력에만 산다). Storybook은
 * 같은 워크스페이스 안에 있으므로 원본 JSON을 직접 읽는다 — main.ts가 이미
 * `@flameware/ui`를 소스로 alias하는 것과 같은 이유(패키지 경계가 아니라
 * 워크벤치라서 소스를 본다). */
import rawScale from "../../../../packages/tokens/tokens/primitive/scale.json"

interface ScaleToken {
  $value: string
  $extensions?: Record<string, unknown>
}

/* JSON import의 생성 타입은 각 리프마다 다른 `$extensions` 모양을 갖는 판별
 * 불가능한 유니온이라 좁혀지지 않는다 — 여기서는 "DTCG 토큰(`$value`가 있는
 * 객체)인가"만 런타임으로 확인하면 충분하므로 그 지점에서 한 번 느슨한
 * 타입으로 받는다. */
const scale = rawScale as unknown as {
  type: { size: Record<string, ScaleToken | string> }
  radius: Record<string, ScaleToken | string>
  space: Record<string, ScaleToken | string>
}

/** `$description` 같은 메타 키(문자열 값)를 걸러낸다 — DTCG 토큰만 남는다. */
const isToken = (value: ScaleToken | string): value is ScaleToken => typeof value === "object"

export const typeSizes = Object.entries(scale.type.size)
  .filter((entry) => isToken(entry[1]))
  .map(([name, token]) => {
    const t = token as ScaleToken
    return {
      name,
      px: t.$extensions?.["design.massive.px"] as number,
      tier: t.$extensions?.["design.massive.typeTier"] as "body" | "mid" | "heading",
    }
  })

export const radii = Object.entries(scale.radius)
  .filter((entry) => isToken(entry[1]) && entry[0] !== "base")
  .map(([name, token]) => {
    const t = token as ScaleToken
    return { name, value: t.$value, px: t.$extensions?.["design.massive.px"] as number }
  })

export const spacePresets = Object.entries(scale.space)
  .filter((entry) => isToken(entry[1]) && entry[0] !== "base")
  .map(([name, token]) => ({ name, value: (token as ScaleToken).$value }))
  .sort((a, b) => Number(a.name) - Number(b.name))
