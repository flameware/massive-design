/* 정규 JSON과 해시.
 *
 * 해시는 **컴포넌트당** 하나다(#22 §9) — Figma의 판정 단위가 컴포넌트이므로
 * 문서 하나에 해시를 하나 두면 Button만 고쳐도 카탈로그 전체가 낡은 것으로 뜬다.
 * 이 값이 Figma 컴포넌트의 `description`에 박힌다.
 *
 * 클래스 순서 정규화는 없다 — Tailwind가 자기 정규 순서로 내보내기 때문에 키
 * 정렬만으로 "의미 없는 diff에 안 흔들린다"가 충족된다(#22 프로브 ①). */
import { createHash } from "node:crypto"

/** 키를 정렬해 찍는다. 배열 순서는 뜻이 있으므로 건드리지 않는다. */
export function canonicalJson(value, indent = 2) {
  return JSON.stringify(sortKeys(value), null, indent) + "\n"
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]))
  }
  return value
}

/**
 * Figma에 대응하는 매니페스트 부분만 해시한다.
 *
 * `className`은 CSS에서 파생된 설명값이고 Figma에 주입되지 않으므로
 * 세대 판정의 입력이 아니다. 반대로 축·기본값·셀의 속성/슬롯/상태는
 * Figma 노드를 만드는 입력이므로 포함한다. 새 파생 필드가 추가되어도
 * 이 목록에 명시하지 않는 한 해시가 조용히 바뀌지 않는다.
 */
function figmaPayload(doc) {
  const cells = (doc.cells ?? []).map(({ props, properties, slots, state }) => ({
    props,
    properties,
    ...(slots ? { slots } : {}),
    ...(state ? { state } : {}),
  }))

  return {
    ...(doc.anatomy?.length ? { anatomy: doc.anatomy } : {}),
    axes: doc.axes,
    base: doc.base,
    cells,
    ...(Object.keys(doc.configurationStates ?? {}).length
      ? { configurationStates: doc.configurationStates }
      : {}),
  }
}

/** sha256 앞 12자. 해시 필드 자신은 입력에서 뺀다. */
export function hashComponent(doc) {
  return createHash("sha256").update(canonicalJson(figmaPayload(doc), 0)).digest("hex").slice(0, 12)
}
