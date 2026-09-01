import { readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { join } from "node:path"

import { cellsOf } from "./manifest/assemble.mjs"
import { policyFor } from "./manifest/classify.mjs"

export const COMPONENT_DIR = "src/components/ui"

/* 구성 상태를 그리는 자리(#148).
 *
 * `configurationStates`는 **무엇을 고를 수 있는가**만 적는다. 그것을 **무엇이 그리는가**는
 * 적히지 않았고, 그래서 `data-[state=checked]:text-primary-foreground`가 계약이 이미
 * 선언한 `checked`를 그리면서도 매니페스트에서는 `unresolved`("아직 못 다뤘다")로
 * 떨어졌다 — 선언과 그림이 매니페스트 안에서 이어져 있지 않았다(#147).
 *
 * 조인은 자동으로 되지 않는다. DOM 속성 이름이 선언 이름과 거의 언제나 다르고
 * (`data-[state=on]` ↔ `pressed`), 값 이름까지 다르다. 선언 이름을 DOM에 맞추는 선택지는
 * ADR-0008이 막는다 — 값 이름의 이름 공간은 축이고 `pressed`는 Radix의 `on`을 우리 말로
 * 옮긴 결과이며 Figma component property 이름까지 따라 바뀐다. 그래서 **이름표는 계약이
 * 진다**: 중앙 대응표를 두면 51개 컴포넌트의 DOM 사실이 계약 밖에 쌓이고 새 컴포넌트의
 * 누락을 아무 게이트도 못 본다.
 *
 * 모양은 두 갈래다 — **값이 이유다**는 `externalSurfaces`와 같다.
 *
 *   drawnBy: { checked: { attribute: "data-state", values: { checked: "checked" } } }
 *   drawnBy: { open: "표면의 존재가 곧 열림이다 — 우리 클래스가 그리지 않는다" }
 *
 * 앞은 우리 클래스가 그리는 경우다. `attribute`는 DOM 이름이고(`data-state`), `values`는
 * **구성 상태 값 → DOM 속성 값**이다. 여기서 `data-[state=checked]`가 파생돼 조립이 그
 * 수식자의 선언을 `unresolved` 대신 셀의 `configurations`로 담는다. 쉬는 값(아무 수식자도
 * 그리지 않는 값)은 `values`에 적지 않는다 — 셀의 `properties`가 이미 그것이다.
 *
 * 뒤는 우리 클래스가 그리지 않는 경우다. 대부분은 표면의 존재·부재나 내용이 그리고,
 * 일부는 그리는 파트가 아직 계약에 없다(#155). **둘을 가려 적는다** — "그리는 것이 없다"와
 * "그리는 것이 계약 밖에 있다"는 다른 사실이고, 뒤는 파트가 등록되면 앞 모양으로 바뀐다.
 *
 * 세 번째 모양이 있다(#184). **우리 클래스가 그리는데 파생 채널이 나르지 않기로 판정된**
 * 경우다 — 앞의 둘 중 어느 것도 아니다: 그리는 클래스가 실재하므로 이유 문자열이 거짓이고,
 * 조립이 담을 자리가 없으므로 `{ attribute, values }`도 거짓이다.
 *
 *   drawnBy: { validity: { modifiers: ["aria-invalid"], carriedBy: "none" } }
 *
 * `carriedBy: "none"`은 `MODIFIER_POLICY`가 그 수식자를 `ignore:`로 판정했다는 뜻이고,
 * **게이트가 `policyFor`로 그것을 실제로 확인한다**. 이유는 여기 복사하지 않는다 — 정본은
 * 정책표의 `ignore:` 값이고, 복사하면 두 자리가 갈린다.
 *
 * 이 모양이 사는 이유는 낡음이다. 앞의 두 모양에서 이유 문자열은 손으로 적은 근거라
 * 뒤집혀도 아무 게이트가 못 보지만(#140), 이 모양의 주장은 **검사 가능한 사실**이다 —
 * #24가 상태 축을 정해 `aria-invalid`의 `ignore:`가 뒤집히면 게이트가 깨지고 누군가
 * 반드시 이 자리를 다시 본다.
 *
 * `carriedBy`에 `"state"`(상태 사다리가 담는다)는 **두지 않는다.** 사다리는 셀 단위이고
 * 같은 계약 안에서도 셀마다 있고 없다 — `input-group`은 루트에 `has-[:disabled]`가 있는데
 * 사다리는 `InputGroupButton` 파트에만 있어 루트의 불투명도는 버려진다. 참으로 쓸 수 있는
 * 계약이 지금 하나도 없는 모드를 열어 두면 거짓 선언을 부른다(ADR-0006).
 *
 * 게이트가 지킬 수 있는 것은 **선언한 수식자가 실제로 우리 클래스에 있는가**와, 세 번째
 * 모양에서 **그 수식자의 정책 등급이 정말 `ignore:`인가**까지다. 앞의 두 모양의 이유
 * 문자열이 참인지는 못 본다 — `externalSurfaces`·`IGNORED_PROPERTIES`와 같은 등급의
 * 손으로 적은 근거이고, ADR-0006대로 지킬 수 없는 것을 지킨다고 적지 않는다. */

/** `{ attribute: "data-state", value: "on" }` → `data-[state=on]`. Tailwind가 쓰는 모양이다. */
export function modifierFor(attribute, value) {
  return `data-[${attribute.slice("data-".length)}=${value}]`
}

/**
 * 세 번째 모양을 검사한다(#184) — **주장이 검사 가능한 유일한 모양**이다.
 *
 * 두 가지를 본다: 선언한 수식자가 우리 클래스에 실제로 있는가(앞의 모양과 같은 검사),
 * 그리고 그 수식자의 정책 등급이 정말 `ignore:`인가. 뒤가 이 모양의 값어치다 — 정책이
 * 뒤집히면 여기서 깨져 이유가 낡은 채 남지 못한다.
 */
function checkCarriedBy(errors, contract, state, drawn, classNames) {
  const { modifiers, carriedBy } = drawn
  if (carriedBy !== "none") {
    errors.push(`carriedBy는 "none"만 쓴다 — 상태 사다리는 셀 단위라 계약이 참으로 말할 수 없다: ${contract.name}.${state}`)
    return
  }
  if (!Array.isArray(modifiers) || modifiers.length === 0 || modifiers.some((m) => typeof m !== "string" || !m.trim())) {
    errors.push(`carriedBy에는 그리는 수식자 목록이 필요하다: ${contract.name}.${state}`)
    return
  }
  for (const modifier of modifiers) {
    if (!classNames.some((cls) => cls.split(/\s+/).some((token) => token.startsWith(`${modifier}:`)))) {
      errors.push(`선언한 수식자가 클래스에 없다: ${contract.name}.${state} (${modifier})`)
      continue
    }
    // 정책표의 판정을 계약에 복사하지 않고 **되묻는다**. 이 줄이 낡음을 막는 자리다
    const policy = policyFor(modifier)
    if (policy === undefined) {
      errors.push(`정책이 없는 수식자를 carriedBy로 적었다 — 지금은 unresolved로 샌다: ${contract.name}.${state} (${modifier})`)
      continue
    }
    if (!policy.startsWith("ignore:")) {
      errors.push(`carriedBy: "none"인데 정책이 나르기로 판정했다: ${contract.name}.${state} (${modifier} → ${policy})`)
    }
  }
}

/** 계약이 내는 모든 클래스 — 루트 셀과 파트 셀 전부. 기본 조합만 보면 다른 variant가 그리는 자리를 놓친다. */
function allClassNames(contract) {
  const classes = []
  const collect = (holder) => {
    try {
      for (const props of cellsOf(holder.config)) classes.push(String(holder.className(props)))
    } catch {
      // config·className이 계약의 모양을 못 갖춘 것은 위에서 이미 잡는다
    }
  }
  collect(contract)
  for (const part of Object.values(contract.parts ?? {})) collect(part)
  return classes
}

/* 외부 소유 표면(#122).
 *
 * 서드파티가 DOM과 스타일을 소유하는 컴포넌트에서, 매니페스트는 **우리 cva가 낸
 * 클래스**만 컴파일해 줍는다. 라이브러리가 스스로 만드는 노드는 클래스를 안 내므로
 * 매니페스트에 아예 나타나지 않는다 — 그리고 `manifest/lint.mjs`가 두 번 이름 붙인
 * 대로 **없는 것은 통과가 아니라 침묵이다.**
 *
 * 그래서 경계를 손으로 적게 하고 게이트가 지킨다. 모양은 classify.mjs의
 * `IGNORED_PROPERTIES`와 같다 — **값이 이유다. 지울 때 근거를 지운다.**
 *
 * `unresolved`("아직 못 다뤘다")와는 다른 등급이다. 외부 소유는 나중에 다뤄질 것이
 * 아니라 **영영 우리 것이 아니다**. 섞으면 unresolved가 다시 잡동사니가 된다. */

/* dismiss 제스처(#110).
 *
 * `externalSurfaces`와 **방향이 반대인** 공백이다. 그쪽은 영영 우리 것이 아닌 노드이고,
 * 이쪽은 upstream primitive가 기본값으로 갖고 와서 **우리 이름으로 출하되는데 계약이
 * 모르는** 동작이다 — 상속 표면. Toast가 오른쪽 스와이프로 닫히는 것을 아무 문서도
 * 적지 않은 채 발행해 온 것이 이 필드가 생긴 이유다.
 *
 * 우리는 제스처 물리를 구현하지 않는다. 계약이 지는 것은 셋뿐이다:
 * **존재**(어느 표면이 제스처로 닫히는가) · **시각 피드백**(끄는 동안 따라오는가) ·
 * **접근성 동등 경로**(제스처 없이 닫는 공개 수단).
 *
 * 게이트가 지킬 수 있는 것은 **선언의 모양**까지다 — 피드백 클래스가 실제로 붙어 있는지는
 * 보지만, 그 애니메이션이 옳은지는 못 본다. 동작 자체는 사람이 본다
 * (`docs/agents/design-system-sync.md`의 터치 절). 지킬 수 없는 것을 지킨다고 적지 않는다.
 *
 * **새 컴포넌트를 계약할 때 upstream primitive가 dismiss 제스처를 갖고 오는지 확인한다.**
 * 게이트는 이걸 못 잡는다 — 서드파티 소스를 읽어야 알 수 있기 때문이다. Radix Toast의
 * `swipeDirection`, Embla의 드래그처럼 **기본값으로 켜져서 오는 것**이 대상이고, 켜져 있다면
 * 끄거나 여기에 선언하거나 둘 중 하나다. 침묵은 선택지가 아니다.
 *
 * 컨트롤 제스처는 여기 오지 않는다. Slider의 값 변경, Scroll Area의 thumb, Carousel의
 * 슬라이드 이동은 드래그가 컨트롤의 기능 자체이고 표면이 사라지지 않는다 — 각 컴포넌트가
 * 자기 축으로 소유하며 키보드 동등 경로는 이미 그 계약 안에 있다. */

export function validateContracts(files, contracts) {
  const errors = []
  const expectedSources = new Set(files.map((file) => `${COMPONENT_DIR}/${file}`))
  const names = new Set()
  const sources = new Set()

  for (const contract of contracts) {
    if (!contract?.name || !contract?.source || !contract?.config || !contract?.className) {
      errors.push("계약에는 name, source, config, className이 모두 필요하다")
      continue
    }
    if (names.has(contract.name)) errors.push(`중복 컴포넌트 이름: ${contract.name}`)
    if (sources.has(contract.source)) errors.push(`중복 컴포넌트 source: ${contract.source}`)
    if (!expectedSources.has(contract.source)) errors.push(`존재하지 않는 계약 source: ${contract.source}`)
    if (!Array.isArray(contract.publicExports) || contract.publicExports.length === 0) {
      errors.push(`공개 export가 없는 계약: ${contract.name}`)
    }
    /* 공개 컴포넌트는 anatomy에 있어야 한다(#121).
     *
     * `parts` 검사는 **anatomy → parts** 한 방향만 봤다. 그래서 `parts`를 두지 않은 계약은
     * anatomy가 비어 있어도 아무것도 걸리지 않았다 — Card가 파트 7개를 공개하면서
     * `anatomy: []`로 43세대를 통과한 이유다. **없는 것은 통과가 아니라 침묵이다**(#122).
     *
     * 반대 방향을 여기서 닫는다: 대문자로 시작하는 공개 export는 컴포넌트이고, 컴포넌트는
     * 파생 채널이 그릴 자리이므로 anatomy에 이름이 있어야 한다. `cva` 헬퍼(`*Variants`,
     * `*VariantsConfig`)는 소문자로 시작해 저절로 빠진다. */
    const anatomyNames = new Set((contract.anatomy ?? []).map((entry) => entry.replace(/[?*]$/, "")))
    for (const exported of contract.publicExports ?? []) {
      if (!/^[A-Z]/.test(exported)) continue
      if (!anatomyNames.has(exported)) errors.push(`anatomy에 없는 공개 컴포넌트: ${contract.name}.${exported}`)
    }

    for (const [partName, part] of Object.entries(contract.parts ?? {})) {
      if (!part?.config || !part?.className) errors.push(`part 계약에는 config와 className이 필요하다: ${contract.name}.${partName}`)
      if (!(contract.anatomy ?? []).some((entry) => entry.replace(/[?*]$/, "") === partName)) {
        errors.push(`anatomy에 없는 part 계약: ${contract.name}.${partName}`)
      }
    }
    const external = contract.externalSurfaces
    if (external !== undefined) {
      const entries = Object.entries(external)
      if (typeof external !== "object" || external === null || Array.isArray(external) || entries.length === 0) {
        errors.push(`externalSurfaces는 비어 있지 않은 객체여야 한다: ${contract.name}`)
      }
      const ours = new Set([
        ...(contract.anatomy ?? []).map((entry) => entry.replace(/[?*]$/, "")),
        ...Object.keys(contract.parts ?? {}),
      ])
      for (const [surface, why] of entries) {
        if (typeof why !== "string" || !why.trim()) {
          errors.push(`외부 소유 표면에는 이유가 필요하다: ${contract.name}.${surface}`)
        }
        // 한 표면이 우리 것이면서 남의 것일 수는 없다. 겹치면 경계가 안 그어진 것이다
        if (ours.has(surface)) {
          errors.push(`외부 소유 표면이 anatomy·parts와 겹친다: ${contract.name}.${surface}`)
        }
      }
    }

    const gestures = contract.gestures
    if (gestures !== undefined) {
      const entries = Object.entries(gestures)
      if (typeof gestures !== "object" || gestures === null || Array.isArray(gestures) || entries.length === 0) {
        errors.push(`gestures는 비어 있지 않은 객체여야 한다: ${contract.name}`)
      }
      const anatomy = new Set((contract.anatomy ?? []).map((entry) => entry.replace(/[?*]$/, "")))
      const exported = new Set(contract.publicExports ?? [])
      for (const [gesture, declaration] of entries) {
        const { surface, feedback, equivalent, why } = declaration ?? {}
        // 외부 소유 표면과 반대다 — 제스처가 닫는 표면은 **우리 것이어야** 한다.
        // 우리 것이 아니면 계약할 자격이 없고 externalSurfaces로 가야 한다
        if (!anatomy.has(surface)) {
          errors.push(`제스처가 닫는 표면이 anatomy에 없다: ${contract.name}.${gesture}`)
        }
        // 접근성 동등 경로는 소비처가 실제로 집을 수 있어야 하므로 공개 export다
        if (!exported.has(equivalent)) {
          errors.push(`제스처의 접근성 동등 경로가 공개 export가 아니다: ${contract.name}.${gesture}`)
        }
        // 피드백은 선언으로 끝내지 않는다. 우리 클래스에 실제로 붙어 있는지 본다
        if (typeof feedback !== "string" || !feedback.trim()) {
          errors.push(`제스처에는 시각 피드백 표식이 필요하다: ${contract.name}.${gesture}`)
        } else if (!String(contract.className({})).includes(feedback)) {
          errors.push(`선언한 시각 피드백이 클래스에 없다: ${contract.name}.${gesture} (${feedback})`)
        }
        if (typeof why !== "string" || !why.trim()) {
          errors.push(`제스처에는 이유가 필요하다: ${contract.name}.${gesture}`)
        }
      }
    }

    const states = contract.configurationStates
    if (typeof states !== "object" || states === null || Array.isArray(states)) {
      errors.push(`configurationStates가 없다: ${contract.name} — 없으면 빈 객체로 적는다`)
    } else {
      const drawnBy = contract.drawnBy ?? {}
      if (typeof drawnBy !== "object" || drawnBy === null || Array.isArray(drawnBy)) {
        errors.push(`drawnBy는 객체여야 한다: ${contract.name}`)
      } else {
        // 두 자리에 적히므로 드리프트가 가능하다. 키가 정확히 같아야 한다 —
        // 남은 drawnBy는 지워진 구성 상태를 그린다고 말하고, 빠진 것은 침묵이다
        for (const state of Object.keys(states)) {
          if (!(state in drawnBy)) errors.push(`구성 상태를 그리는 자리가 선언되지 않았다: ${contract.name}.${state}`)
        }
        const classNames = allClassNames(contract)
        for (const [state, drawn] of Object.entries(drawnBy)) {
          if (!(state in states)) {
            errors.push(`구성 상태가 아닌 것에 drawnBy가 있다: ${contract.name}.${state}`)
            continue
          }
          if (typeof drawn === "string") {
            if (!drawn.trim()) errors.push(`그리는 자리가 클래스가 아니면 이유가 필요하다: ${contract.name}.${state}`)
            continue
          }
          if (typeof drawn !== "object" || drawn === null || Array.isArray(drawn)) {
            errors.push(`drawnBy 항목은 이유 문자열이거나 { attribute, values } 또는 { modifiers, carriedBy }여야 한다: ${contract.name}.${state}`)
            continue
          }
          if ("carriedBy" in drawn) {
            checkCarriedBy(errors, contract, state, drawn, classNames)
            continue
          }
          const { attribute, values } = drawn
          if (typeof attribute !== "string" || !attribute.startsWith("data-") || attribute.length <= "data-".length) {
            errors.push(`그리는 속성은 data-* 이름이어야 한다: ${contract.name}.${state}`)
            continue
          }
          const entries = Object.entries(values ?? {})
          if (typeof values !== "object" || values === null || Array.isArray(values) || entries.length === 0) {
            errors.push(`그리는 속성에는 값 대응이 필요하다: ${contract.name}.${state}`)
            continue
          }
          for (const [value, domValue] of entries) {
            if (!states[state].includes(value)) {
              errors.push(`구성 상태에 없는 값을 대응시킨다: ${contract.name}.${state}.${value}`)
              continue
            }
            if (typeof domValue !== "string" || !domValue.trim()) {
              errors.push(`DOM 속성 값이 비어 있다: ${contract.name}.${state}.${value}`)
              continue
            }
            // 제스처의 피드백 검사와 같은 종류다 — 선언으로 끝내지 않고 우리 클래스에
            // 실제로 붙어 있는지 본다. 없으면 매니페스트는 아무것도 해소하지 못한다
            const modifier = modifierFor(attribute, domValue)
            if (!classNames.some((cls) => cls.includes(`${modifier}:`))) {
              errors.push(`선언한 수식자가 클래스에 없다: ${contract.name}.${state}.${value} (${modifier})`)
            }
          }
        }
      }
    }

    const reference = contract.reference
    if (!reference || !reference.example || !reference.guidance) {
      errors.push(`reference 계약이 없는 컴포넌트: ${contract.name}`)
    } else {
      for (const field of ["use", "evidence", "limits"]) {
        if (!reference.guidance[field]?.trim()) errors.push(`authored guidance가 비어 있다: ${contract.name}.${field}`)
      }
    }
    names.add(contract.name)
    sources.add(contract.source)
  }

  for (const source of expectedSources) if (!sources.has(source)) errors.push(`계약이 없는 컴포넌트 source: ${source}`)
  if (errors.length) throw new Error(errors.join("\n"))
  return contracts
}

export async function loadComponentContracts(root) {
  const dir = join(root, COMPONENT_DIR)
  const files = readdirSync(dir).filter((file) => file.endsWith(".tsx")).sort()
  const modules = await Promise.all(files.map((file) => import(pathToFileURL(join(dir, file)).href)))
  const contracts = modules.map((module, index) => {
    if (!module.componentContract) throw new Error(`계약이 없는 컴포넌트 source: ${COMPONENT_DIR}/${files[index]}`)
    for (const name of module.componentContract.publicExports ?? []) {
      if (!(name in module)) throw new Error(`계약의 공개 export가 source에 없다: ${module.componentContract.name}.${name}`)
    }
    return module.componentContract
  })
  return validateContracts(files, contracts).sort((a, b) => a.name.localeCompare(b.name))
}

export function publicBarrel(contracts) {
  const lines = ["/* Generated by scripts/generate-component-contracts.mjs. Do not edit. */"]
  for (const contract of contracts) {
    const source = `./${contract.source.replace(/^src\//, "").replace(/\.tsx$/, ".js")}`
    lines.push(`export { ${contract.publicExports.join(", ")} } from ${JSON.stringify(source)}`)
  }
  return `${lines.join("\n")}\n`
}
