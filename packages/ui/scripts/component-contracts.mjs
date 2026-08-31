import { readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { join } from "node:path"

export const COMPONENT_DIR = "src/components/ui"

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
