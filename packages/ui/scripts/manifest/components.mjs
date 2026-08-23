/* 컴포넌트 가까이의 componentContract가 단일 정본이다. 이 모듈은 기존 import
 * 경로를 유지하면서 파일 시스템에서 계약을 발견할 뿐, 등록 정보를 복제하지 않는다. */
import { fileURLToPath } from "node:url"

import { loadComponentContracts } from "../component-contracts.mjs"

const root = fileURLToPath(new URL("../..", import.meta.url))
export const COMPONENTS = await loadComponentContracts(root)
